#include "ProcessControler.h"

#include <iostream>

ProcessControler::ProcessControler(QObject *parent) : QObject(parent)
{
    if(!settings.contains("gateway_ips_macs_in_preference_order"))
        settings.setValue("gateway_ips_macs_in_preference_order","1.2.3.4-00:00:00:00:00:00,9.8.7.6-00:00:00:00:00:00");
    QStringList ips=settings.value("gateway_ips_macs_in_preference_order").toString().split(",");
    if(ips.size()<2)
    {
        std::cerr << "You need at least 2 ip and mac to work for gateway_ips_macs_in_preference_order: 1.2.3.4-00:00:00:00:00:00,9.8.7.6-00:00:00:00:00:00" << std::endl;
        abort();
    }

    if(!settings.contains("continous_up_to_consider_up"))
        settings.setValue("continous_up_to_consider_up","5");
    continous_up_to_consider_up=settings.value("continous_up_to_consider_up").toUInt();
    if(continous_up_to_consider_up<1 || continous_up_to_consider_up>255)
    {
        std::cerr << "continous_up_to_consider_up should be >0 and <256" << std::endl;
        abort();
    }

    if(!settings.contains("continous_down_to_consider_down"))
        settings.setValue("continous_down_to_consider_down","5");
    continous_down_to_consider_down=settings.value("continous_down_to_consider_down").toUInt();
    if(continous_down_to_consider_down<1 || continous_down_to_consider_down>255)
    {
        std::cerr << "continous_down_to_consider_down should be >0 and <256" << std::endl;
        abort();
    }

    if(!settings.contains("script_on_gateway_change"))
        settings.setValue("script_on_gateway_change","/tmp/script.sh");
    script_on_gateway_change=settings.value("script_on_gateway_change").toString();

    callScriptAgain=false;

    int index=0;
    while(index<ips.size())
    {
        QStringList stringList=ips.at(index).split("-");
        if(stringList.size()!=2)
        {
            std::cerr << "You need at this format for gateway_ips_macs_in_preference_order: 1.2.3.4-00:00:00:00:00:00: " << ips.at(index).toStdString() << std::endl;
            abort();
        }
        QString ip=stringList.first();
        QString mac=stringList.last();

        Gateway gateway;
        gateway.process=new QProcess();
        gateway.ip=ip;
        gateway.lastStatus=true;
        gateway.sendtext=true;
        gateway.process->start("/usr/bin/nping", QStringList() << "8.8.8.8" << "--dest-mac" << mac << "-c" << "0");
        connect(gateway.process,&QProcess::readyReadStandardError,this,&ProcessControler::readyReadStandardError);
        connect(gateway.process,&QProcess::readyReadStandardOutput,this,&ProcessControler::readyReadStandardOutput);
        gatewayList[gateway.process]=gateway;
        processList.append(gateway.process);
        index++;
    }
}

void ProcessControler::readyReadStandardError()
{
    QProcess* process = qobject_cast<QProcess*>(sender());
    if(process!=NULL)
    {
        QString output=process->readAllStandardError();
        std::cerr << output.toStdString() << std::endl;
    }
    else
    {
        std::cerr << "ProcessControler::readyReadStandardError(), abort()" << std::endl;
        abort();
    }
}

void ProcessControler::readyReadStandardOutput()
{
    QProcess* process = qobject_cast<QProcess*>(sender());
    if(process!=NULL)
    {
        QString output=process->readAllStandardOutput();
        Gateway &gateway=gatewayList[process];
        if(!gateway.sendtext)
        {
            if(output.startsWith("SENT "))
                gateway.sendtext=true;
        }
        else
        {
            if(output.startsWith("SENT "))
            {
                gateway.lastStatusList.push_back(false);
                if((unsigned int)gateway.lastStatusList.size()>=continous_up_to_consider_up)
                {
                    int index=gateway.lastStatusList.size()-1;
                    while((unsigned int)index>gateway.lastStatusList.size()-1-continous_up_to_consider_up)
                    {
                        if(gateway.lastStatusList.at(index)!=true)
                            break;
                        index--;
                    }
                    if((unsigned int)index<=gateway.lastStatusList.size()-1-continous_up_to_consider_up)
                        if(!gateway.lastStatus)
                        {
                            std::cout << "Now " << gateway.ip.toStdString() << " is up" << std::endl;
                            gateway.lastStatus=true;
                            callTheScript();
                        }
                    while((unsigned int)gateway.lastStatusList.size()>continous_up_to_consider_up && (unsigned int)gateway.lastStatusList.size()>continous_down_to_consider_down)
                        gateway.lastStatusList.removeFirst();
                }
            }
            else if(output.startsWith("RCVD "))
            {
                gateway.lastStatusList.push_back(true);
                int index=gateway.lastStatusList.size()-1;
                while((unsigned int)index>gateway.lastStatusList.size()-1-continous_down_to_consider_down)
                {
                    if(gateway.lastStatusList.at(index)!=false)
                        break;
                    index--;
                }
                if((unsigned int)index<=gateway.lastStatusList.size()-1-continous_down_to_consider_down)
                    if(gateway.lastStatus)
                    {
                        std::cout << "Now " << gateway.ip.toStdString() << " is down" << std::endl;
                        gateway.lastStatus=false;
                        callTheScript();
                    }
                while((unsigned int)gateway.lastStatusList.size()>continous_down_to_consider_down && (unsigned int)gateway.lastStatusList.size()>continous_down_to_consider_down)
                    gateway.lastStatusList.removeFirst();
            }
        }
    }
    else
    {
        std::cerr << "ProcessControler::readyReadStandardOutput(), abort()" << std::endl;
        abort();
    }
}

void ProcessControler::callTheScript()
{
    if(script_on_gateway_change.isEmpty())
        return;
    if(gatewayList.isEmpty())
        return;

    int index=0;
    while(index<processList.size())
    {
        const Gateway &gateway=gatewayList.value(processList.at(index));
        if(gateway.lastStatus)
        {
            if(scriptProcess.state()==QProcess::NotRunning)
                scriptProcess.start(script_on_gateway_change,QStringList() << gateway.ip);
            else
                callScriptAgain=true;
            return;
        }
        index++;
    }

    const Gateway &gateway=gatewayList.value(processList.first());
    if(gateway.lastStatus)
    {
        if(scriptProcess.state()==QProcess::NotRunning)
            scriptProcess.start(script_on_gateway_change,QStringList() << gateway.ip);
        else
            callScriptAgain=true;
        return;
    }
}

void ProcessControler::finished()
{
    if(callScriptAgain)
    {
        callScriptAgain=false;
        callTheScript();
    }
}

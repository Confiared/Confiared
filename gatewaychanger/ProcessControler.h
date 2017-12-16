#ifndef PROCESSCONTROLER_H
#define PROCESSCONTROLER_H

#include <QObject>
#include <QSettings>
#include <QProcess>
#include <QList>
#include <QString>
#include <QHash>

class ProcessControler : public QObject
{
    Q_OBJECT
public:
    explicit ProcessControler(QObject *parent = nullptr);
private slots:
    void readyReadStandardError();
    void readyReadStandardOutput();
    void callTheScript();
    void finished(int, QProcess::ExitStatus);
private:
    QSettings settings;
    unsigned int continous_up_to_consider_up;
    unsigned int continous_down_to_consider_down;
    QString script_on_gateway_change;

    struct Gateway
    {
        QProcess * process;
        QString ip;
        QList<bool> lastStatusList;
        bool lastStatus;

        //nping
        bool sendtext;
    };
    QList<QProcess *> processList;
    QHash<QProcess *,Gateway> gatewayList;
    QProcess scriptProcess;
    bool callScriptAgain;
    unsigned int lastEnabledGatewayIndex;
};

#endif // PROCESSCONTROLER_H

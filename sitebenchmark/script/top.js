var lasturlrun;
var comparemode=false;
String.prototype.trunc = String.prototype.trunc ||
function(n){
    return (this.length > n) ? this.substr(0, n-1) + '&hellip;' : this;
};
function loadjson(datas,url) {
    var pagespeedline=datas['pagespeed'].split("\n");
    var thisRegex = new RegExp('\(score=[0-9]+\)');
    var scoretot=0,scorecount=0;

    for (var i = 0; i < pagespeedline.length; i++)
    {
        var line=pagespeedline[i];
        if(thisRegex.test(line))
        {
            scoretot+=parseInt(line.replace(/.*\(score=([0-9]+)\).*/g,"$1"));
            scorecount++;
        }
    }

    var requests=0;
    var pagesizetemp=0;
    var harcontent=atob(datas['har']);
    var har = JSON.parse(harcontent);
    var startTime = new Date(har.log.pages[0].startedDateTime);

    var firsttime=-1;
    har.log.entries.forEach(function(entry) {
        pagesizetemp+=entry.response.bodySize;
        if(firsttime==-1)
            firsttime=parseInt(entry.timings.wait);
        requests++;
    });

    var score=Math.round(scoretot/scorecount);
    var pagesize=0;
    if(pagesizetemp/1000>1000)
        pagesize=Math.round(pagesizetemp/1000000).toString()+" MB";
    else
        pagesize=Math.round(pagesizetemp/1000).toString()+" KB";
    var timetoload=Math.round(parseInt(datas['timetoload'])/1000*10)/10;
    var newhtml="";
    newhtml+="<table>";
    newhtml+="<tr><td><h2>Summary for "+url+"</h2></td></tr>";
    newhtml+="<tr><td>";
        newhtml+="<table>";
        newhtml+="<tr>";
            newhtml+="<td rowspan=\"2\">";
                newhtml+="<div class=\"blockperf screenshot\"><img src=\"data:image/png;base64,"+datas['thumbnail']+"\" alt=\"\"></div>";
            newhtml+="</td>";
            newhtml+="<td>";
                newhtml+="<div class=\"blockperf infoblock\"><div class=\"title\">Performance grade</div><div class=\"value\">";
                if(scorecount>0)
                {
                    if(score>=90)
                        newhtml+="<span class=\"lettergood\">A</span>";
                    else if(score>=75)
                        newhtml+="<span class=\"letteraverage\">B</span>";
                    else
                        newhtml+="<span class=\"letterbad\">C</span>";
                }
                newhtml+=" "+score.toString()+"</div></div>";
            newhtml+="</td>";
            newhtml+="<td>";
                newhtml+="<div class=\"blockperf infoblock\"><div class=\"title\">Load time</div><div class=\"value\">"+timetoload+" s</div></div>";
            newhtml+="</td>";
            newhtml+="<td>";
                newhtml+="<div class=\"blockperf infoblock\"><div class=\"title\">IPv6</div><div class=\"value\">";
                if(datas['haveipv6'])
                    newhtml+="<span class=\"lettergood\">Yes</span>";
                else
                    newhtml+="<span class=\"letterbad\">No</span>";
                newhtml+="</div></div>";
            newhtml+="</td>";
        newhtml+="</tr>";
        newhtml+="<tr>";
            newhtml+="<td>";
                newhtml+="<div class=\"blockperf infoblock\"><div class=\"title\">Page size</div><div class=\"value\">"+pagesize+"</div></div>";
            newhtml+="</td>";
            newhtml+="<td>";
                newhtml+="<div class=\"blockperf infoblock\"><div class=\"title\">Requests</div><div class=\"value\">"+requests.toString()+"</div></div>";
            newhtml+="</td>";
            newhtml+="<td>";
                newhtml+="<div class=\"blockperf infoblock\"><div class=\"title\">First byte</div><div class=\"value\">";
                if(firsttime<70)
                    newhtml+="<span class=\"lettergood\">A</span>";
                else if(firsttime<140)
                    newhtml+="<span class=\"letteraverage\">B</span>";
                else
                    newhtml+="<span class=\"letterbad\">C</span>";
                newhtml+=" "+firsttime.toString()+" ms</div></div>";
            newhtml+="</td>";
        newhtml+="</tr>";
    newhtml+="</td></tr>";
    var perfprobdisplayed=false;
        for (var i = 0; i < pagespeedline.length; i++)
        {
            var line=pagespeedline[i];
            if(thisRegex.test(line))
            {
                var linescore=parseInt(line.replace(/.*\(score=([0-9]+)\).*/g,"$1"));
                if(i<5 || linescore<100)
                {
                    if(!perfprobdisplayed)
                    {
                        newhtml+="<tr><td><h2>Performance problem</h2></td></tr>";
                        perfprobdisplayed=true;
                    }
                    newhtml+="<tr><td colspan=\"4\"><button class=\"accordion\"><div style=\"float:left;width:75px;font-weight:bold;\">";
                    if(linescore>=90)
                        newhtml+="<span class=\"lettergood\">A</span>";
                    else if(linescore>=75)
                        newhtml+="<span class=\"letteraverage\">B</span>";
                    else
                        newhtml+="<span class=\"letterbad\">C</span>";
                    newhtml+=" "+linescore.toString()+"</div>";
                    newhtml+=line.replace(/.*_([^_]+)_.*/g,"$1")+"</button><div class=\"panel\">";
                    var havestartul=false;
                    for (var j = i+1; j < pagespeedline.length; j++)
                    {
                        var linesub=pagespeedline[j];
                        if(thisRegex.test(linesub))
                            break;
                        if(linesub.startsWith("    * "))
                        {
                            if(havestartul==false)
                            {
                                newhtml+="<ul>";
                                havestartul=true;
                            }
                        }
                        else
                        {
                            if(havestartul==true)
                            {
                                newhtml+="</ul>";
                                havestartul=false;
                            }
                        }
                        if(linesub.startsWith("http://") || linesub.startsWith("https://") || linesub.startsWith("    * http://") || linesub.startsWith("    * https://"))
                        {
                            var startli=linesub.startsWith("    * ");
                            linesub = linesub.replace("    * ", "");
                            if(startli)
                                newhtml+="<li>";
                            newhtml+="<a href=\""+linesub+"\">"+linesub.trunc(50)+"</a><br />";
                            if(startli)
                                newhtml+="</li>";
                        }
                        else
                            newhtml+=linesub+"<br />";
                    }
                    newhtml+="</div></td></tr>";
                }
            }
        }
    newhtml+="</table><br />";
    if(!comparemode)
        newhtml+="<div id=\"HarViewer\"></div>";
    else
        comparemode=false;
    document.getElementById("step3").innerHTML = newhtml;

    var acc = document.getElementsByClassName("accordion");var i;
    for (i = 0; i < acc.length; i++) {
        acc[i].onclick = function(){
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }

        }

    }
}
function step1() {
    if(document.getElementById("step1").style.display != "none")
    {
        var url=document.getElementById('url').value;
        if(url=="")
            return;
        else
        {
            document.getElementById("step1").style.display = "none";
            document.getElementById("step2").style.display = "block";
            document.getElementById("step3").style.display = "none";
            document.getElementById("step4").style.display = "none";
            
            if(!url.startsWith("http://") && !url.startsWith("https://"))
                url="http://"+url;
                
            if(!comparemode)
                document.getElementById("trd").innerHTML = "<div id=\"step4\"></div>";
            
            document.getElementById("step2").innerHTML = "<h1>Analyse in progress...</h1><h3>"+url+"</h3><div id=\"cooking\"><div class=\"bubble\"></div><div class=\"bubble\"></div><div class=\"bubble\"></div><div class=\"bubble\"></div><div class=\"bubble\"></div><div id=\"area\"><div id=\"sides\"><div id=\"pan\"></div><div id=\"handle\"></div></div><div id=\"pancake\"><div id=\"pastry\"></div></div></div></div>";
                
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4)
                {
                    document.getElementById("step1").style.display = "block";
                    document.getElementById("step2").style.display = "none";
                    document.getElementById("step3").style.display = "block";
                    document.getElementById("step4").style.display = "block";
                    if(this.status == 200)
                    {
                        lasturlrun=url;
                        //this.responseText
                        var datas = JSON.parse(this.responseText);

                        if(!url.includes(".optimize.confiared.com"))
                            document.getElementById("Compare").style.display = "block";
                        else
                            document.getElementById("Compare").style.display = "none";
                        if ("saveid" in datas)
                        {
                            if(window.location.href.match("^[a-z]+://[^/]+/save/[a-f0-9]{8}$")===null || !comparemode)
                                window.location.href = "/save/"+datas['saveid'];
                            else
                            {
                                var saveid=window.location.href.replace(/^[a-z]+:\/\/[^/]+\/save\/([a-z0-9]{8})/g,'$1');
                                window.location.href = "/save/"+saveid+"/"+datas['saveid'];
                            }
                        }
                        else
                        {
                            loadjson(datas,url);
                            if(!comparemode)
                            {
                                harviewer = new HarViewer('HarViewer');
                                var harcontent=atob(datas['har']);
                                var har = JSON.parse(harcontent);
                                harviewer.loadHar(har);
                            }
                        }
                    }
                    else
                        document.getElementById("step3").innerHTML = "<br /><br /><h3>Bug, contact the admin</h3><br /><br />";
                }
            };
            xhttp.open("POST", "/benchmark.php", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("url="+url);
        }
    }
}
function compare() {
    if(lasturlrun!="")
    {
        var element = document.getElementById("HarViewer");
        element.outerHTML = "";
        delete element;
        
        document.getElementById("trd").innerHTML = document.getElementById("tro").innerHTML.replace("div id=\"step3\"", "div id=\"step4\"");
        
        var count1 = (lasturlrun.match(/\//g) || []).length;
        if(count1<3)
            lasturlrun=lasturlrun+".optimize.confiared.com";
        else
        {
            var strpos=lasturlrun.indexOf("/",8);
            if(strpos==-1)
                lasturlrun=lasturlrun+".optimize.confiared.com";
            else
                lasturlrun=lasturlrun.slice(0, strpos) + ".optimize.confiared.com" + lasturlrun.slice(strpos);
        }
        
        document.getElementById("Compare").style.display = "none";
        //document.getElementById("HarViewer").style.display = "none";
        document.getElementById('url').value=lasturlrun;
        comparemode=true;
        step1();
    }
}

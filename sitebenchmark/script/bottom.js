var re = /^[a-z]+:\/\/[^/]+\/save\/([a-z0-9]{8})$/g;
if(window.location.href.match(re)!==null)
{
    var saveid=window.location.href.replace(/^[a-z]+:\/\/[^/]+\/save\/([a-z0-9]{8})$/g,'$1');
    
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
                //this.responseText
                var datas = JSON.parse(this.responseText);
                var url=datas['url'];
                lasturlrun=url;
                document.getElementById('url').value=url;
                loadjson(datas,url);
                if(!url.includes(".optimize.confiared.com"))
                    document.getElementById("Compare").style.display = "block";
                else
                    document.getElementById("Compare").style.display = "none";
                harviewer = new HarViewer('HarViewer');
                var harcontent=atob(datas['har']);
                var har = JSON.parse(harcontent);
                harviewer.loadHar(har);
            }
            else
                document.getElementById("step3").innerHTML = "<br /><br /><h3>Bug, contact the admin</h3><br /><br />";
        }
    };
    xhttp.open("POST", "/save.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("saveid="+saveid);
}
else
{
    var re = /^[a-z]+:\/\/[^/]+\/save\/([a-z0-9]{8})\/([a-z0-9]{8})$/g;
    if(window.location.href.match(re)!==null)
    {
        var saveid=window.location.href.replace(/^[a-z]+:\/\/[^/]+\/save\/([a-z0-9]{8})\/([a-z0-9]{8})$/g,'$1');
        var saveidbis=window.location.href.replace(/^[a-z]+:\/\/[^/]+\/save\/([a-z0-9]{8})\/([a-z0-9]{8})$/g,'$2');
        
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
                    //this.responseText
                    var datas = JSON.parse(this.responseText);
                    var url=datas['url'];
                    lasturlrun=url;
                    document.getElementById('url').value=url;
                    loadjson(datas,url);
                    if(!url.includes(".optimize.confiared.com"))
                        document.getElementById("Compare").style.display = "block";
                    else
                        document.getElementById("Compare").style.display = "none";
                    
                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4)
                        {
                            if(this.status == 200)
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
                                document.getElementById('url').value=lasturlrun;
                                comparemode=true;
                            
                                //this.responseText
                                var datas = JSON.parse(this.responseText);
                                var url=datas['url'];
                                lasturlrun=url;
                                document.getElementById('url').value=url;
                                loadjson(datas,url);
                                if(!url.includes(".optimize.confiared.com"))
                                    document.getElementById("Compare").style.display = "block";
                                else
                                    document.getElementById("Compare").style.display = "none";
                            }
                            else
                                document.getElementById("step3").innerHTML = "<br /><br /><h3>Bug, contact the admin</h3><br /><br />";
                        }
                    };
                    xhttp.open("POST", "/save.php", true);
                    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xhttp.send("saveid="+saveidbis);
                }
                else
                    document.getElementById("step3").innerHTML = "<br /><br /><h3>Bug, contact the admin</h3><br /><br />";
            }
        };
        xhttp.open("POST", "/save.php", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("saveid="+saveid);
    }
}

// Get the input field
var input = document.getElementById("url");
// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Cancel the default action, if needed
  event.preventDefault();
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Trigger the button element with a click
    step1();
  }
});

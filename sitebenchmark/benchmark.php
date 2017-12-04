<?php
if(!isset($_POST['url']))
    exit;
$httppos=strpos($_POST['url'],'http://');
$httpspos=strpos($_POST['url'],'https://');
if($httppos===FALSE && $httpspos==FALSE)
    die('$httppos===FALSE && $httpspos==FALSE');
if($httppos!=0 && $httpspos!=0)
    die('$httppos!=0 && $httpspos!=0');

$ch = curl_init(); 
curl_setopt($ch, CURLOPT_URL, "http://[2001:470:5:1a9::70]/cgi-bin/sitespeed.py?url=".$_POST['url']); 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
$output = curl_exec($ch); 

// Check HTTP status code
if (!curl_errno($ch)) {
  switch ($http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE)) {
    case 200:  # OK
        if($output === FALSE)
            echo 'Curl error: ' . curl_error($ch);
        else
        {
            if(strpos($output,'har')===FALSE)
                echo 'Empty content: "'.$output.'" for: "'.$_POST['url'].'"';
            else
            {
                header('Content-type: application/json');
                echo $output;
            }
        }
      break;
    default:
      die('Unexpected HTTP code: '.$http_code);
  }
}

curl_close($ch);

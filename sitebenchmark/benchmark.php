<?php
if(!isset($_POST['url']))
    die('no post');
$httppos=strpos($_POST['url'],'http://');
$httpspos=strpos($_POST['url'],'https://');
if($httppos===FALSE && $httpspos===FALSE)
    die('$httppos===FALSE && $httpspos==FALSE');
if($httppos!=0 && $httpspos!=0)
    die('$httppos!=0 && $httpspos!=0');

function filewrite($file,$content)
{
	if($filecurs=fopen($file, 'w'))
	{
		if(fwrite($filecurs,$content) === false)
			die('Unable to write the file: '.$file);
		fclose($filecurs);
	}
	else
		die('Unable to write or create the file: '.$file);
}

$ch = curl_init(); 
curl_setopt($ch, CURLOPT_URL, "http://[2803:1920::3:70]/cgi-bin/sitespeed.py?url=".$_POST['url']); 
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
                $bytes = openssl_random_pseudo_bytes(1);
                $hex   = bin2hex($bytes);
                if(!mkdir('saves/'.$hex,0755,TRUE))
                    die('mkdir failed');
                $bytes = openssl_random_pseudo_bytes(1);
                $hex2   = bin2hex($bytes);
                if(!mkdir('saves/'.$hex.'/'.$hex2,0755,TRUE))
                    die('mkdir failed 2');
                $bytes = openssl_random_pseudo_bytes(2);
                $hex3   = bin2hex($bytes);
                {
                    $arr=json_decode($output,TRUE);
                    $arr['url']=$_POST['url'];
                    filewrite('saves/'.$hex.'/'.$hex2.'/'.$hex3,json_encode($arr));
                }
                $arr=json_decode($output,TRUE);
                $arr['saveid']=$hex.$hex2.$hex3;
                echo json_encode($arr);
            }
        }
      break;
    default:
      die('Unexpected HTTP code: '.$http_code);
  }
}
else
    echo 'Curl error: ' . curl_error($ch);

curl_close($ch);

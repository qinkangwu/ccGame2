<?php
$bas=dirname(__FILE__);
$path=$bas.'/assets/Game9/';
if(is_dir($path)){
  $files=scandir($path);
  unset($files[0]);unset($files[1]);
  $out_str='[';
  foreach($files as $v){
    $tmp=explode('.',$v);
    if($tmp[0]){
    $out_str.='{"url":"assets/Game9/'.$v.'","key":"'.$tmp[0].'"},';}
    //$out_str.='"images/xulie/'.$v.'",'.'';}
    //$out_str.= "images/mainView/'.$v.'";
  }
  $out_str=rtrim($out_str,',');
  $out_str.=']';
  echo $out_str;
}
?>

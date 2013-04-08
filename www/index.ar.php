<?php
header('content-type: application/json; charset=utf-8');
error_reporting(E_ERROR);

function truncateText($string, $limit, $break = ".", $pad = "...") {
    // return with no change if string is shorter than $limit
    if (strlen($string) <= $limit)
        return $string;

    // is $break present between $limit and the end of the string?
    if (false !== ($breakpoint = strpos($string, $break, $limit))) {
        if ($breakpoint < strlen($string) - 1) {
            $string = substr($string, 0, $breakpoint) . $pad;
        }
    }

    return $string;
}

$url = 'http://www.t3me.com/ar/rss/all';

$ch = curl_init();
$timeout = 0;
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
$file_contents = curl_exec($ch);
curl_close($ch);

$xml = simplexml_load_string($file_contents);
/*
  echo "<pre>";
  print_r($xml);
  echo "</pre>";
 */
// forecast
//$day = count($xml->forecast->day);
//print_r($xml);

$doc = new DOMDocument();

$items = 75;
for ($i = 0; $i < $items; $i++) {
    $category = (string) $xml->channel->item[$i]->category;
    
    if($category != ""){
    $type = explode("/", (string) $xml->channel->item[$i]->link);
    
    $data['item'][$i]['title'] = (string) $xml->channel->item[$i]->title;
    $data['item'][$i]['link'] = (string) $xml->channel->item[$i]->link;
    $data['item'][$i]['description'] = (string) $xml->channel->item[$i]->description;
    $data['item'][$i]['type'] = $type[4];
    $doc->loadHTML($data['item'][$i]['description']);
    $images = $doc->getElementsByTagName('img');
    $paragraphs = $doc->getElementsByTagName('p');

    foreach ($images as $k => $image) {
        $data['item'][$i]['images'][$k] = $image->getAttribute('src');
    }

    foreach ($paragraphs as $k => $paragraph) {
        $data['item'][$i]['text'][$k] = $paragraph->nodeValue;
    }

    if (isset($data['item'][$i]['text'])) {
        $j = 0;
        foreach($data['item'][$i]['text'] as $k => $value){
            if($data['item'][$i]['text'][$k] != "" ){
                $shortdesc[$j] = truncateText($value, 240);
                $j++;
            }

        }
        
        $data['item'][$i]['shortdesc'] = $shortdesc[0];
    }

    $data['item'][$i]['category'] = $category;
    $data['item'][$i]['pubDate'] = (string) $xml->channel->item[$i]->pubDate;
    }
    
}


echo $_GET['callback'] . '(' . json_encode($data) . ')';

/* echo "<pre>";
  print_r($data);
  echo "</pre>";
 */
?>


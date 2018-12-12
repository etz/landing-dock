<?php
ini_set('memory_limit', '-1');
set_time_limit(0);
require_once('getid3/getid3.php');

// Initialize getID3 engine
$getID3 = new getID3;

$songs = [];
$nodata = [];
$dc = 0;
$nc = 0;
$files = glob('assets/music/*.mp3');

foreach($files as $file) {
    try {
        $info = $getID3->analyze($file);
        getid3_lib::CopyTagsToComments($info);
        if (isset($info['comments_html'])) {
            $songs[] = [
                'path' => $file,
                'title' => $info['comments_html']['title'][0],
                'artist' => $info['comments_html']['artist'][0],
                'art' => isset($info['comments']['picture'][0]) ? "data:".$info['comments']['picture'][0]['image_mime'].";base64," . base64_encode($info['comments']['picture'][0]['data']) : ""
            ];
            $dc++;
        }
        else {
            $songs[] = [
                'path' => $file,
                'title' => 'Unknown',
                'artist' => 'Unknown',
                'art' => ""
            ];
            $nodata[] = $file;
            $nc++;
        }
    } catch (Exception $e) {
        $songs[] = [
            'path' => $file,
            'title' => 'Unknown',
            'artist' => 'Unknown',
            'art' => ""
        ];
        $nodata[] = $file;
        $nc++;
    }
}

file_put_contents('songs.json', json_encode($songs));

echo "Have ID3 Tags: " . $dc ."\n<br>Need ID3 Tags: ". $nc . "\n<br><br>";

echo implode("<br>", $nodata);
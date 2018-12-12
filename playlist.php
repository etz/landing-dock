<!DOCTYPE html>
<html>
<head>
	<title>jk.la playlist</title>
	<style type="text/css">
		body {
			font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		}
		.song {
			display: block;
			clear: both;
			margin: 5px;
			border: solid 1px #eee;
			width: 400px;
		}
		.artist {
			padding-top: 4px;
			padding-left: 45px;
		}
		.title {
			padding-left: 45px;
		}
		.art {
			display: inline-block;
			float: left;
		}
		.id {
			padding-top: 4px;
			padding-right: 4px;
			display: inline;
			float: right;
		}
		a {
			color: #444;
		}
		a:hover, a:active, a:visited {
			color: #444;
		}
	</style>
</head>
<body>
<?php
	$data = file_get_contents("songs.json");
	$data = json_decode($data);
	foreach ($data as $key => $song): ?>
			<div class="song">
				<div class="id">
					<a href="https://jk.la/#song-<?php echo $key; ?>">Song #<?php echo $key; ?></a>
				</div>
				<div class="art">
					<?php if(!empty($song->art)): ?>
						<img width="32px" height="32px" src="<?php echo $song->art; ?>" />
					<?php else: ?>
						<img src="disk.png" />
					<?php endif ?>
				</div>
				<div class="artist">
					<?php echo $song->artist; ?>
				</div>
				<div class="title">
					<?php echo $song->title; ?>
				</div>
			</div>
<?php
	endforeach;
?>
</body>
</html>
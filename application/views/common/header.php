<?php
	$PageTitle = (isset($PageTitle)) ? $PageTitle : '';
    $ext = $this->config->item('base_url') . '/extjs';
    $stiki = $this->config->item('base_url');
    $app = $stiki . '/app';
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xml:lang="en" xmlns="http://www.w3.org/1999/xhtml" lang="en-AU">
<head>
	<title><?php echo $PageTitle; ?></title>
	<link rel="stylesheet" type="text/css" href="<?php echo $ext; ?>/resources/css/ext-all.css">
	<link rel="stylesheet" type="text/css" href="<?php echo $stiki; ?>/css/admin.css">
	<script type="text/javascript">var Web = { HOST: '<?php echo $stiki; ?>' }</script>
	<script type="text/javascript" src="<?php echo $ext; ?>/bootstrap.js"></script>
	<script type="text/javascript" src="<?php echo $stiki; ?>/js/ext.data.js"></script>
</head>
<body class="framedBody">
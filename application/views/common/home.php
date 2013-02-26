<?php
    $ext = $this->config->item('base_url') . '/extjs';
    $base_url = $this->config->item('base_url');
    $app = $base_url . '/app';
?>
<!DOCTYPE html>
<head>
	<meta http-equiv="Content-type" content="text/html; charset=UTF-8" />
	<title>Administrator Home</title>
	<link rel="stylesheet" type="text/css" media="all" href="<?php echo $ext; ?>/resources/css/ext-all.css" />
	<link rel="stylesheet" type="text/css" media="all" href="<?php echo $base_url; ?>/css/admin.css" />
	<style>
		/* Background Image Login */
		img.bg {
			/* Set rules to fill background */
			min-height: 100%; min-width: 1024px;
			
			/* Set up proportionate scaling */
			width: 100%; height: auto;
			
			/* Set up positioning */
			position: fixed; top: 0; left: 0;
		}
		
		@media screen and (max-width: 1024px) {
			img.bg { left: 50%; margin-left: -512px; }
		}
		
        #MainPanel .x-tab-bar-strip {
            top: 30px !important; 							/* Default value is 20, we add 20 = 40 */
        }

        #MainPanel .x-tab-bar .x-tab-bar-body {
            height: 33px !important;						/* Default value is 23, we add 20 = 43 */
            border: 0 !important;							/* Overides the border that appears on resizing the grid */
        }

        #MainPanel .x-tab-bar .x-tab-bar-body .x-box-inner {
            height: 31px !important;						/* Default value is 21, we add 20 = 41 */
        }

        #MainPanel .x-tab-bar .x-tab-bar-body .x-box-inner .x-tab {
            height: 31px !important;						/* Default value is 21, we add 20 = 41 */
        }

        #MainPanel .x-tab-bar .x-tab-bar-body .x-box-inner .x-tab button {
            height: 23px !important;						/* Default value 13, we add 20 = 33 */
            line-height: 23px !important;					/* Default value 13, we add 20 = 33 */
        }
        #MainPanel .x-tab button { font-size:13px !important; }
	</style>
	<script type="text/javascript">URLS = <?php echo json_encode( array( 'stiki' => $base_url, 'ext' => $ext, 'app' => $app ) ); ?>;</script>
	<script type="text/javascript" src="<?php echo $ext; ?>/ext-all.js"></script>
	<script type="text/javascript" src="<?php echo $app; ?>/app.js"></script>
</head>
<body>
<!--
	<div style="display:none;">
		<img src="<?php echo $base_url . '/images/logo/'; ?>" class="bg">
	</div>
-->
	
    <div id="loading">loading...</div>
	<div id="header" style="display:none;">
        <?php include 'headerp.php'; ?>
	</div>
	
	<div id="footer" style="display:none;">
		<div style="height: 30px; background: #DFE8F6;">
			<div style="padding: 5px 0 10px 10px;" id="CntFooter">
				@ <?php echo date("Y"); ?> UB
			</div>
		</div>
	</div>
</body>
</html>
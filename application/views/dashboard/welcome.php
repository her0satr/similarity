<?php
	$SiteDashboard = $this->Config_model->GetByID(array('config_name' => 'Site Dashboard'));
	echo $SiteDashboard['config_content'];
?>
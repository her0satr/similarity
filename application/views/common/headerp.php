<?php
    $base_url = $this->config->item('base_url');
	
	$User = $this->User_model->GetCurrentUser();
	$SiteName = $this->Config_model->GetByID(array('config_name' => 'Site Name'));
?>
	<h1 id="logo"><div style="height: 50px;"><?php echo $SiteName['config_content']; ?></div></h1>

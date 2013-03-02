<?php $this->load->view('common/header', array('PageTitle' => 'Rating Process'));?>
<script type="text/javascript" src="<?php echo $this->config->item('base_url'); ?>/js/similarity/rating_process.js"></script>

<div id="loading_mask">
    <div class="loading">
        <p><img src="<?php echo $this->config->item('base_url').'/images/loading.gif'?>"></p>
        <p>Loading...</p>
    </div>
</div>

<div class="wi">
	<div id="x-cnt">
		<div id="grid-member"></div>
	</div>
</div>

<?php $this->load->view('common/footer');?>
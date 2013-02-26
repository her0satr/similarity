<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class combo extends CI_Controller {
    function __construct() {
        parent::__construct();
    }
    
    function index() {
        $this->User_model->LoginRequired();
		$Action = $this->input->post('Action');
		$NameLike = $this->input->post('NameLike');
		$NameLike = (empty($NameLike)) ? $this->input->post('query') : $NameLike;
		
		$ForceID = $this->input->post('ForceID');
		$TempForceID = preg_replace('/[^0-9]+/i', '', $ForceID);
		$ForceDisplayID = ($ForceID == $TempForceID) ? $ForceID : 0;
		
		$Limit = 75;
        $Result = array();
		
		if ($Action == 'Item') {
			$Result = $this->Item_model->GetArray(array('ForceDisplayID' => $ForceDisplayID, 'NameLike' => $NameLike));
		}
		
		echo json_encode($Result);
    }
}
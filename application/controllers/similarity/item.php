<?php
class item extends CI_Controller {
    function __construct() {
        parent::__construct();
    }
    
    function index() {
        $this->load->view( 'similarity/item' );
    }
	
    function grid() {
        $this->User_model->LoginRequired();
		
		$result['success'] = true;
		$result['rows'] = $this->Item_model->GetArray($_POST);
		$result['totalCount'] = $this->Item_model->GetCount($_POST);
        
        json_response($result);
    }
	
	function action() {
        $this->User_model->LoginRequired();
		
		$Result = array();
		$Action = (isset($_POST['Action'])) ? $_POST['Action'] : '';
		
		if ($Action == 'UpdateItem') {
			$Result = $this->Item_model->Update($_POST);
		} else if ($Action == 'GetItemByID') {
			$Result = $this->Item_model->GetByID(array('item_id' => $_POST['item_id']));
		} else if ($Action == 'DeteleItemByID') {
			$Result = $this->Item_model->Delete(array('item_id' => $_POST['item_id']));
		}
		
		echo json_encode($Result);
	}
	
	function view() {
		$this->load->view( 'similarity/popup/item');
	}
}
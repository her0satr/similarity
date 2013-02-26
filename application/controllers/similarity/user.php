<?php
class user extends CI_Controller {
    function __construct() {
        parent::__construct();
    }
    
    function index() {
        $this->load->view( 'similarity/user' );
    }
	
    function grid() {
        $this->User_model->LoginRequired();
		
		$result['success'] = true;
		$result['rows'] = $this->User_model->GetArray($_POST);
		$result['totalCount'] = $this->User_model->GetCount($_POST);
        
        json_response($result);
    }
	
	function action() {
        $this->User_model->LoginRequired();
		
		$Result = array();
		$Action = (isset($_POST['Action'])) ? $_POST['Action'] : '';
		
		if ($Action == 'UpdateUser') {
			$Result = $this->User_model->Update($_POST);
		} else if ($Action == 'GetUserByID') {
			$Result = $this->User_model->GetByID(array('user_id' => $_POST['user_id']));
		} else if ($Action == 'DeteleUserByID') {
			$Result = $this->User_model->Delete(array('user_id' => $_POST['user_id']));
		}
		
		echo json_encode($Result);
	}
	
	function view() {
		$this->load->view( 'similarity/popup/user');
	}
}
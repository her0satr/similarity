<?php

/*
 * Copyright 2011 by ORCA, Jl. Taman Sulfat 7 No 4, Malang, ID
 * All rights reserved
 * 
 * Written By: Herry
 */

/**
 * User controllers
 *
 * @author Herry
 */
class config extends CI_Controller {
    function __construct() {
        parent::__construct();
    }
    
    function index() {
        $this->User_model->LoginRequired();
        $this->load->view( 'site/config' );
    }
	
	function action() {
        $this->User_model->LoginRequired();
		$UserAdmin = $this->session->userdata('UserAdmin');
		
		$Result = array();
		$Action = (isset($_POST['Action'])) ? $_POST['Action'] : '';
		
		if ($Action == 'UpdateConfig') {
			if (isset($_POST['ImageTypeText']) && $_POST['ImageTypeText'] == 'Logo Gereja') {
				$Config = $this->Config_model->GetByID(array('config_name' => 'Logo Gereja', 'gereja_id' => $_POST['gereja_id']));
				if (count($Config) == 0) {
					$_POST['hidden'] = 1;
					$_POST['config_id'] = 0;
					$_POST['config_name'] = $_POST['ImageTypeText'];
				} else {
					$_POST['config_id'] = $Config['config_id'];
				}
			}
			$Result = $this->Config_model->Update($_POST);
		} else if ($Action == 'GetConfigByID') {
			if (empty($_POST['config_id']) && $_POST['ImageTypeText'] == 'Logo Gereja') {
				$ParamConfig['gereja_id'] = $AccessGerejaID;
				$ParamConfig['config_name'] = $_POST['ImageTypeText'];
			} else {
				$ParamConfig['config_id'] = $_POST['config_id'];
			}
			
			$Result = $this->Config_model->GetByID($ParamConfig);
		} else if ($Action == 'DeteleConfigByID') {
			$Result = $this->Config_model->Delete($_POST);
		}
		
		echo json_encode($Result);
	}
	
    function grid() {
        $this->User_model->LoginRequired();
		
		$result['success'] = true;
		$result['rows'] = $this->Config_model->GetArray($_POST);
		$result['totalCount'] = $this->Config_model->GetCount($_POST);
        
        json_response($result);
    }
	
	function view() {
		$this->load->view( 'site/popup/config' );
	}
}


<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class dashboard extends CI_Controller {
	function index() {
		$this->load->view('dashboard/welcome');
	}
}
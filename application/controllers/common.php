<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class common extends CI_Controller {
	function index() {
		$Data['Message'] = '';
		if (isset($_POST['username'])) {
			$User = $this->User_model->GetByID(array('user_name' => $_POST['username']));
			
			if (count($User) == 0) {
				$Data['Message'] = 'Maaf, user tidak ditemukan';
			} else {
				$password = (isset($_POST['password'])) ? $_POST['password'] : '';
				if ($User['user_password'] == EncriptPassword($password)) {
					unset($User['user_password']);
					$this->User_model->SetCurrentUser($User);
					
					if ( isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest' ) {
						$ArrayMenu = $this->Permission_model->GetArrayMenuGroup(array('GroupID' => $User['group_id']));
						echo json_encode( array( 'success' => true, 'menu' => $ArrayMenu, 'UserAdmin' => $User ));
						return;
					}
					
					$LinkRedirect = $this->config->item('base_url');
					header("Location: " . $LinkRedirect); exit;
				}
			}
		}
		
		$this->load->view('common/home');
	}
	
	function check() {
		$IsLogin = $this->User_model->IsLogin();
		if ($IsLogin) {
			$ArrayMenu = $this->Permission_model->GetArrayMenuGroup(array());
			
			echo json_encode( array( 'success' => true, 'menu' => $ArrayMenu ));
			return;
		}
        
		show_error("Not logged in", 403);
	}
	
	function logout() {
		$this->User_model->Logout();
	}
}

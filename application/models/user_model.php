<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User_model extends CI_Model {
	function __construct() {
        parent::__construct();
		
		$this->Field = array('user_id', 'user_name', 'user_password', 'user_fullname', 'user_email', 'user_last_login');
    }
	
	function Update($Param) {
		$Result = array();
		
		if (empty($Param['user_id'])) {
			$InsertQuery  = GenerateInsertQuery($this->Field, $Param, USER);
			$InsertResult = mysql_query($InsertQuery) or die(mysql_error());
			
			$Result['user_id'] = mysql_insert_id();
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data berhasil tersimpan.';
		} else {
			$UpdateQuery  = GenerateUpdateQuery($this->Field, $Param, USER);
			$UpdateResult = mysql_query($UpdateQuery) or die(mysql_error());
			
			$Result['user_id'] = $Param['user_id'];
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data berhasil diperbaharui.';
		}
		
		return $Result;
	}
	
	function GetByID($Param) {
		$Array = array();
        
		if (isset($Param['user_name'])) {
            $SelectQuery  = "
				SELECT User.*, UserGroup.*
				FROM ".USER." User
				LEFT JOIN ".USER_GROUP." UserGroup ON UserGroup.user_id = User.user_id
				WHERE user_name = '".$Param['user_name']."'
				LIMIT 1";
		} else if (isset($Param['user_email'])) {
            $SelectQuery  = "SELECT * FROM ".USER." WHERE user_email = '".$Param['user_email']."' LIMIT 1";
		} else if (isset($Param['reset_token'])) {
            $SelectQuery  = "SELECT * FROM ".USER." WHERE reset_token = '".$Param['reset_token']."' LIMIT 1";
		} else if (isset($Param['user_id'])) {
			$SelectQuery  = "
				SELECT User.*, UserGroup.*
				FROM ".USER." User
				LEFT JOIN ".USER_GROUP." UserGroup ON UserGroup.user_id = User.user_id
				WHERE User.user_id = '".$Param['user_id']."'
				LIMIT 1";
        }
        
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		if (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$Array = StripArray($Row);
			
			/*
			$FileFoto = $this->config->item('base_path') . '/images/user/' . $Array['user_photo'];
			if (!empty($Array['user_photo']) && file_exists($FileFoto)) {
				$Array['FotoLink'] = $this->config->item('base_url') . '/images/user/' . $Array['user_photo'];
			} else {
				$Array['FotoLink'] = $this->config->item('base_url') . '/images/default-image.png';
			}
			/*	*/
		}
		
		return $Array;
	}
	
	function GetArray($Param = array()) {
		$Array = array();
		$StringSearch = (isset($Param['NameLike'])) ? "AND user_fullname LIKE '%" . $Param['NameLike'] . "%'"  : '';
		$StringFilter = GetStringFilter($Param);
		
		$PageOffset = (isset($Param['start']) && !empty($Param['start'])) ? $Param['start'] : 0;
		$PageLimit = (isset($Param['limit']) && !empty($Param['limit'])) ? $Param['limit'] : 25;
		$StringSorting = (isset($Param['sort'])) ? GetStringSorting($Param['sort']) : 'occupation ASC';
		
		$SelectQuery = "
			SELECT User.*
			FROM ".USER." User
			WHERE 1 $StringSearch $StringFilter
			ORDER BY $StringSorting
			LIMIT $PageOffset, $PageLimit
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
            unset($Row['password']);
            
			$Row = StripArray($Row, array('user_last_login'));
			$Array[] = $Row;
		}
		
		return $Array;
	}
	
	function GetCount($Param = array()) {
		$TotalRecord = 0;
		
		$StringSearch = (isset($Param['NameLike'])) ? "AND user_fullname LIKE '%" . $Param['NameLike'] . "%'"  : '';
		$StringFilter = GetStringFilter($Param);
		
		$SelectQuery = "
			SELECT COUNT(*) AS TotalRecord
			FROM ".USER." User
			WHERE 1 $StringSearch $StringFilter
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$TotalRecord = $Row['TotalRecord'];
		}
		
		return $TotalRecord;
	}
	
	function Delete($Param) {
        $DeleteQuery  = "DELETE FROM ".USER." WHERE user_id = '".$Param['user_id']."' LIMIT 1";
        $DeleteResult = mysql_query($DeleteQuery) or die(mysql_error());
        
        $Result['QueryStatus'] = '1';
        $Result['Message'] = 'Data berhasil dihapus.';
		
		return $Result;
	}
	
	function LoginRequired() {
		// No User
		return;
		
		$UserAdmin = $this->GetCurrentUser();
		
		if (! is_array($UserAdmin) || count($UserAdmin) <= 0) {
			header("Location: " . $this->config->item('base_url') . "/");
			exit;
		}
	}
	
	function IsLogin() {
		$Result = false;
		$User = $this->GetCurrentUser();
		if (is_array($User) && count($User) > 0) {
			$Result = true;
		}
		
		// No User
		$Result = true;
		
		return $Result;
	}
	
	function SetCurrentUser($Param) {
		$this->session->set_userdata(array('UserAdmin' => $Param));
	}
	
	function GetCurrentUser() {
		$UserAdmin = $this->session->userdata('UserAdmin');
		return $UserAdmin;
	}
	
	function Logout() {
		$this->session->unset_userdata('UserAdmin');
		header("Location: " . $this->config->item('base_url') . "/");
		exit;
	}
	
	function RequestPassword($Param) {
		$User = $this->GetByID(array('email' => $Param['Email']));
		if (count($User) > 0) {
			$TempValue = date("Y-m-d H:i:s") . rand(1000,9999);
			$ResetValue = md5($TempValue);
			$this->UpdateResetPassword(array('UserID' => $User['UserID'], 'reset' => $ResetValue));
			
			$Message  = "Seseorang telah melakukan reset password untuk account :\n";
			$Message .= "Username : ".$User['username']."\n";
			$Message .= "Email : ".$User['email']."\n";
			$Message .= "Jika ini adalah kesalahan, maka abaikan email ini.\n";
			$Message .= "Untuk melakukan reset password, silahkan klik pada link berikut :\n";
			$Message .= $this->config->item('base_url') . '/administrator/action/reset-password/' . $ResetValue;
			@mail($Param['Email'], 'Reset Password', $Message);
			
			$Result['QueryStatus'] = 1;
			$Result['Message'] = 'Reset password berhasil dikirimkan ke email anda.';
		} else {
			$Result['QueryStatus'] = 0;
			$Result['Message'] = 'Maaf, email anda tidak ditemukan.';
		}
		
		return $Result;
	}
	
	function ResetPassword($ResetValue) {
		$User = $this->GetByID(array('reset' => $ResetValue));
		if (count($User) > 0 && !empty($ResetValue)) {
			$TempValue = date("Y-m-d H:i:s") . rand(1000,9999);
			$Password = substr(md5($TempValue), 0, 20);
			
			$Message  = "Password account anda berhasil direset, berikut informasi account anda :\n\n";
			$Message .= "Username : ".$User['username']."\n";
			$Message .= "Email : ".$User['email']."\n";
			$Message .= "Password : ".$Password."\n\n";
			$Message .= "Terima Kasih\n";
			$Message .= "Admin";
			@mail($User['email'], 'Informasi Password Baru', $Message);
			
			$this->UpdateResetPassword(array('UserID' => $User['UserID'], 'reset' => ''));
			$this->UpdatePassword(array('UserID' => $User['UserID'], 'password' => md5($Password)));
			
			$Result = 'Silahkan memeriksa email anda untuk informasi password baru.';
		} else {
			$Result = 'Maaf, link ini sudah tidak aktif.';
		}
		return $Result;
	}
}
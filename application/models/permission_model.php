<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Permission_model extends CI_Model {
	function __construct() {
        parent::__construct();
    }
	
	function GetCollection($Param = array()) {
		$User = $this->User_model->GetCurrentUser();
		
		$ArrayPermission[] = array( 'Group' => 'Similarity', 'Link' => '/index.php/similarity/item', 'Title' => 'Item' );
		$ArrayPermission[] = array( 'Group' => 'Similarity', 'Link' => '/index.php/similarity/user', 'Title' => 'User' );
		$ArrayPermission[] = array( 'Group' => 'Similarity', 'Link' => '/index.php/similarity/process', 'Title' => 'Similarity Process' );
		$ArrayPermission[] = array( 'Group' => 'Similarity', 'Link' => '/index.php/similarity/rating_process', 'Title' => 'Rating Process' );
		
		$ArrayPermission[] = array( 'Group' => 'Site', 'Link' => '/index.php/site/config', 'Title' => 'Site Config' );
		
		/*	
		// Check Module for each Group
		$ArrayTemp = array();
		foreach ($ArrayPermission as $Key => $Array) {
			if (isset($Array['group_id']) && in_array($User['group_id'], $Array['group_id'])) {
				$ArrayTemp[] = $Array;
			}
		}
		$ArrayPermission = $ArrayTemp;
		/*	*/
		
		$ArrayResult['PermissionData'] = $ArrayPermission;
		$ArrayResult['PermissionCount'] = count($ArrayPermission);
		
		return $ArrayResult;
	}
	
	function GetArrayMenuGroup($Param) {
		$Array = $this->GetArrayMenu($Param);
		
		$ArrayTemp = array();
		foreach ($Array as $Key => $Temp) {
			$ArrayTemp[$Temp['Group']][] = $Temp;
		}
		
		$Counter = 0;
		$ArrayResult = array();
		foreach ($ArrayTemp as $Key => $Temp) {
			$ArrayResult[$Counter]['Title'] = $Key;
			$ArrayResult[$Counter]['Child'] = $Temp;
			
			$Counter++;
		}
		
		return $ArrayResult;
	}
	
	function GetArrayMenu($Param = array()) {
		$ArrayResultMenu = array();
		$Permission = $this->GetCollection($Param);
		foreach ($Permission['PermissionData'] as $Key => $Array) {
			$ArrayResultMenu[] = $Array;
		}
		
		return $ArrayResultMenu;
	}
}
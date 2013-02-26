<?php
class process extends CI_Controller {
    function __construct() {
        parent::__construct();
    }
    
    function index() {
        $this->load->view( 'similarity/process' );
    }
	
    function grid() {
        $this->User_model->LoginRequired();
		
		$result['success'] = true;
		$result['rows'] = $this->Result_model->GetArray($_POST);
		$result['totalCount'] = $this->Result_model->GetCount($_POST);
        
        json_response($result);
    }
	
    function trigger() {
		$item_primary = $_POST['item_primary'];
		$ItemCount = $this->Item_model->GetCount();
		
		for ($i = 0; $i < $ItemCount; $i++) {
			$item_secondary = $this->Result_model->GetNextSecondary($item_primary);
			if (empty($item_secondary)) {
				$Result['Loop'] = 0;
				$Result['Message'] = 'Similarity process done.';
				break;
			}
			
			// Similarity Item
			$ItemPrimary = $this->Data_model->GetArrayUser($item_primary);
			$ItemSecondary = $this->Data_model->GetArrayUser($item_secondary);
			$SimilarityItem = new Similarity($ItemPrimary, $ItemSecondary);
			
			// Similarity Group
			$ClusterPrimary = $this->Cluster_model->GetArrayUser($item_primary, 'c1');
			$ClusterSecondary = $this->Cluster_model->GetArrayUser($item_secondary, 'c2');
			$SimilarityGroup = new Similarity($ClusterPrimary, $ClusterSecondary);
			
			// Similarity
			$Similarity = ($SimilarityItem->Result * (1 - C)) + ($SimilarityGroup->Result * C);
			
			$ResultCheck = $this->Result_model->GetByID(array('item_primary' => $item_primary, 'item_secondary' => $item_secondary));
			$result_id = (count($ResultCheck) == 0) ? 0 : $ResultCheck['result_id'];
			$ParamUpdate = array(
				'result_id' => 0,
				'item_primary' => $item_primary,
				'item_secondary' => $item_secondary,
				'similarity_item' => $SimilarityItem->Result,
				'similarity_group' => $SimilarityGroup->Result,
				'similarity' => $Similarity
			);
			$Result = $this->Result_model->Update($ParamUpdate);
			$Result['Loop'] = 1;
			
			if ($i >= 5) {
				break;
			}
		}
		
		echo json_encode($Result);
    }
}
<?php
class rating_process extends CI_Controller {
    function __construct() {
        parent::__construct();
    }
    
    function index() {
        $this->load->view( 'similarity/rating_process' );
    }
	
    function grid() {
        $this->User_model->LoginRequired();
		
		$result['success'] = true;
		$result['rows'] = $this->Prediction_model->GetArray($_POST);
		$result['totalCount'] = $this->Prediction_model->GetCount($_POST);
        
        json_response($result);
    }
	
    function trigger() {
		$user_id = $_POST['user_id'];
		
		$ArrayPrediction = $this->Prediction_model->GetArray(array('user_id' => $user_id));
		$ArrayItem = $this->Item_model->get_item_without_rate($user_id);
		
		$Request = array( 'Loop' => 0, 'Message' => '' );
		if (count($ArrayPrediction) == 0 && count($ArrayItem) > 0) {
			$ArrayAverage = $this->Data_model->GetAverage();
			$ArrayUserRate = $this->Data_model->GetArray(array('user_id' => $user_id, 'limit' => 2000, 'ArrayKey' => 'item_id'));
			
			foreach ($ArrayItem as $Item) {
				// Collect Prediction Parameter
				$Array = array(
					'item_data' => array(),
					'item_average' => (isset($ArrayAverage[$Item['item_id']])) ? $ArrayAverage[$Item['item_id']] : 0
				);
				$ArraySimilarity = $this->Result_model->GetArray(array('item_primary' => $Item['item_id'], 'limit' => 2000, 'ArrayKey' => 'item_secondary'));
				foreach ($ArrayUserRate as $Key => $Value) {
					$ArrayTemp = array(
						'user_score' => $Value,
						'average_score' => $ArrayAverage[$Key],
						'similarity' => (isset($ArraySimilarity[$Key])) ? $ArraySimilarity[$Key] : 0
					);
					$Array['item_data'][] = $ArrayTemp;
				}
				
				// Do Prediction
				$Prediction = new Prediction($Array);
				
				// Update Prediction Result
				$UpdateParam = array(
					'prediction_id' => 0,
					'user_id' => $user_id,
					'item_id' => $Item['item_id'],
					'prediction_value' => $Prediction->Result
				);
				$UpdateResult = $this->Prediction_model->Update($UpdateParam);
				$Request['Message'] = $UpdateResult['Message'];
			}
		}
		
		$Request['next_user_id'] = $this->User_model->get_next_user($user_id);
		if (empty($Request['next_user_id'])) {
			$Request['Loop'] = 0;
		}
		
		echo json_encode($Request);
    }
}
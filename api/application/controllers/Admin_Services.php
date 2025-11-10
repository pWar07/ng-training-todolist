<?php
defined('BASEPATH') or exit('No direct script access allowed');

require FCPATH . 'vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;


class Admin_services extends CI_Controller
{

    public function __construct() {
        parent::__construct();

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Authorization, Access-Token, Content-Type, Accept, Access-Control-Request-Method");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        $this->load->database();
        $this->load->model('common_model');
        $this->load->model('admin_model');
        $this->load->library('Authorization_Token');

        $postJson = file_get_contents("php://input");
        $decodedPost = json_decode($postJson, true);

        if ($decodedPost) {
            $_POST = $decodedPost;
        }

        $headers = $this->input->request_headers();
        $function = $this->router->fetch_method();

        if ($function != "login") {
            $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;

            if (empty($authHeader)) {
                $response['success'] = 3;
                $response['message'] = "Missing Authorization header.";
                $this->output->set_status_header(401);
                echo json_encode($response);
                exit;
            }

            $decodedToken = $this->authorization_token->validateToken($authHeader);

            if (empty($decodedToken) || ($decodedToken["status"] === false)) {
                $response['success'] = 2;
                $response['message'] = "Failed to authenticate request.";
                $this->output->set_status_header(401);
                echo json_encode($response);
                exit;
            }

            $authenticate = $this->db->get_where("admins", array("admin_id" => $decodedToken["data"]->id))->row_array();
            if (empty($authenticate)) {
                $response['success'] = 5;
                $response['message'] = "Failed to authenticate request.";
                $this->output->set_status_header(401);
                echo json_encode($response);
                exit;
            }
        }
    }

    public function login($action = null) {
        $post = $this->input->post();

        // echo json_encode($post);die;

        $response["success"] = 0;
        $response["message"] = "";

        $actions = ['with_password'];

        if (in_array($action, $actions)) {

            if ($action == 'with_password') {
                if (empty($post['email'])) {
                    $response["message"] = "Please enter Email.";
                } else if (empty($post['password'])) {
                    $response["message"] = "Please enter Password.";
                } else {
                    $payload = ['email' => $post['email'], 'password' => md5($post['password'])];

                    $data = $this->admin_model->user_auth($payload);

                    // $user_type_id = $data['user_type_id'];
                    $user_id = $data['admin_id'];

                    // print_r($data);
                    // die;

                    if (!empty($data)) {


                        // $user_permission_exists = $this->db->get_where('users_permissions',array('user_id'=>$user_id))->result_array();


                        // if(!empty($user_permission_exists)){

                        // $get_permissions = $this->db->query("SELECT up.*,m.module_name,m.module_slug from users_permissions up
                        //                                  LEFT JOIN modules m ON up.module_id = m.id 
                        //                                  WHERE up.user_id = $user_id "
                        //                             )->result_array();
                        // }
                        // else{
                        // $get_permissions = $this->db->query("SELECT r.*,m.module_name,m.module_slug from role_permissions r
                        //                                  LEFT JOIN modules m ON r.module_id = m.id 
                        //                                  WHERE r.user_type_id = $user_type_id ")->result_array();

                        // }



                        // $issued_at = time();
                        // $expiration_time = $issued_at  + 3600*24*7;

                        // $token_data = array(
                        //     'issued_at' => $issued_at,
                        //     'expiration_time' => $expiration_time,
                        //     'username' => $data['username']
                        // );

                        $token_data['id'] = $data['admin_id'];

                        // $jwt = JWT::encode($token_data, $this->key, $this->algorithm);
                        $jwt_token = $this->authorization_token->generateToken($token_data);




                        $response['data']['user_id'] = $data['admin_id'];
                        $response['data']['name'] = $data['name'];
                        $response['data']['email'] = $data['email'];
                        $response['data']['token'] = $jwt_token;
                        // foreach ($get_permissions as $key => $per) {



                        //     $response['data']['permissions'][] = array(
                        //         'can_add' => $per['can_add'],
                        //         'can_edit' => $per['can_edit'],
                        //         'can_view' => $per['can_view'],
                        //         'can_export' => $per['can_export'],
                        //         'can_delete' => $per['can_delete'],
                        //         'slug' => $per['module_slug']
                        //     );

                        // }

                        $response["success"] = 1;
                        $response["message"] = "Logged in successfully.";
                    } else {
                        $response["success"] = 0;
                        $response["message"] = "Invalid Credentials.";
                    }
                }
            }
        } else {
            $response["success"] = 0;
            $response["message"] = "Invalid URL";
            // $this->output->set_status_header(404);
        }

        echo json_encode($response);
    }

    public function manage_tasks ($action = NULL) {
        $post = $this->input->post();
        $savetime = time();

        $response["success"] = 0;
        $response["message"] = "";

        $actions = ['save', 'list', 'delete', 'change_status'];

        if (in_array($action, $actions)) {

            if ($action == 'save') {

                if (empty($post["assigned_to"])) {
                    $response["message"] = "Please select user to be assigned task.";
                } 
                else if (empty($post["status"])) {
                    $response["message"] = "Status can't be empty.";
                }
                else if (empty($post["due_date"])) {
                    $response["message"] = "Please select Due Date.";
                } 
                else if (empty($post["priority"])) {
                    $response["message"] = "Priority can't be empty.";
                } 
                else {
                    
                    $savetime = time();

                    /* Save Task Data */
                    $data = array(
                        'assigned_to' => $post['assigned_to'],
                        'due_date' => $post['due_date'],
                        'priority' => $post['priority'],
                        'status' => $post['status'],
                        'due_date' => strtotime($post['due_date']),
                        'comments' => !empty($post['comments']) ? $post['comments'] : NULL,
                    );

                    if (!empty($post['task_id'])) {
                        $data['task_id'] = $post['task_id'];
                        $data['updated_at'] = $savetime;
                    } else {
                        $data['updated_at'] = $savetime;
                        $data['created_at'] = $savetime;
                    }

                    $task_id = $this->admin_model->save_task($data);

                    /* Save Task Data */

                    if ($task_id) {
                        $response["success"] = 1;
                        $response["message"] = !empty($post['task_id']) ? "Task details updated." : "Task details saved.";
                    } else {
                        $response["message"] = "Oppss..! Something went wrong.";
                    }

                }
            } 
            else if ($action == 'list') {

                $and_condition = " AND t.deleted_at IS NULL ";

                $pagelimit = "";
                $post["limit"] = $post["limit"] ? $post["limit"] : 1000;
                if ($post["page"] && $post['limit']) {
                    $post["page"] = (int)$post["page"];
                    $post["limit"] = (int)$post["limit"];
                    $pagelimit .= " limit " . (($post["page"] - 1) * $post["limit"]) . ", " . $post["limit"];
                }

                if ($post["from_date"] && $post["to_date"]) {
                    $from_date =  strtotime(date($post["from_date"] . "00:00:01"));
                    $to_date =  strtotime(date($post["to_date"] . "23:59:59"));
                    $and_condition .= " and t.created_at >= " . $from_date . " and t.created_at <= " . $to_date;
                }

                if (!empty($post['status'])) {
                    $and_condition .= " and t.status='" . $post['status']."' ";
                }
                
                if (!empty($post['priority'])) {
                    $and_condition .= " and t.priority='" . $post['priority']."' ";
                }

                if ($post['task_id'] != "") {
                    $and_condition .= " and t.task_id=" . $post['task_id'];
                }

                $filter_query = " ";
                if (!empty($post['sort_by']) &&  !empty($post['sort_order'])) {
                    $sort_by = $post['sort_by'];
                    // $sort_by = "t." . $post['sort_by'];
                    $sort_order =  $post['sort_order'];

                    $filter_query .= " ORDER BY " . $sort_by . " " . $sort_order . "";
                } else {
                    $filter_query .= " ORDER BY t.created_at DESC ";
                }


                $search_q = "";
                if (isset($post['search']) && $post['search'] != "") {
                    $searchColumns = "t.status, t.priority, t.comments, u.name";
                    $searchColumns = explode(", ", $searchColumns);
                    $searchTerms = [$post['search']];
                    foreach ($searchTerms as $searchTerm) {
                        foreach ($searchColumns as $searchColumn) {
                            if ($search_q == "") {
                                $search_q .= " and (" . $searchColumn . " like '%" . $searchTerm . "%' ";
                            } else {
                                $search_q .= " or " . $searchColumn . " like '%" . $searchTerm . "%' ";
                            }
                        }
                    }
                    $search_q .= ")";
                }

                $list = $this->db->query("SELECT SQL_CALC_FOUND_ROWS t.*, u.name FROM tasks t LEFT JOIN users u ON u.user_id = t.assigned_to WHERE 1=1 " . $and_condition . $search_q . $filter_query . $pagelimit)->result_array();

                $queryNew = $this->db->query('SELECT FOUND_ROWS() as myCounter');

                $iFilteredTotal = $queryNew->row()->myCounter;

                if (!empty($list)) {

                    foreach ($list as $i => $unit) {
                        $response['list'][$i] = array();
                        $response['list'][$i]['task_id'] = $unit['task_id'];
                        $response['list'][$i]['assigned_to'] = $unit['assigned_to'];
                        $response['list'][$i]['name'] = $unit['name'];
                        $response['list'][$i]['priority'] = $unit['priority'];
                        $response['list'][$i]['status'] = $unit['status'];
                        $response['list'][$i]['comments'] = !empty($unit['comments']) ? $unit['comments'] : "";
                        $response['list'][$i]['due_date'] = $unit["due_date"] ? date("Y-m-d", $unit["due_date"]) : "";
                        $response['list'][$i]['due_date_formatted'] = $unit["due_date"] ? date("d-m-Y", $unit["due_date"]) : "";
                        
                        $response['list'][$i]['created_at'] = $unit["created_at"] ? date("d-m-Y", $unit["created_at"]) : "";
                        $response['list'][$i]['updated_at'] = $unit["updated_at"] ? date("d-m-Y", $unit["updated_at"]) : "";
                    }

                    $response['success'] = 1;
                    $response['total'] = floatval($iFilteredTotal);
                    $response["message"] = (int)($iFilteredTotal) . " records found.";
                } 
                else {
                    $response['success'] = 0;
                    $response["message"] = "No records found.";
                }
            } 
            else if ($action == 'delete') {

                if (!$post["task_id"]) {
                    $response["message"] = "Task Id can't be blank.";
                } else {

                    $delete = $this->db->update('tasks', array('deleted_at' => $savetime), array('task_id' => $post['task_id']));

                    if ($delete) {
                        $response["success"] = 1;
                        $response["message"] = "Task details deleted.";
                    } else {
                        $response["success"] = 0;
                        $response["message"] = "Oppss..! Something went wrong.";
                    }
                }
            } 
            else if ($action == 'change_status') {

                if (!$post["task_id"]) {
                    $response["message"] = "Task Id can't be blank.";
                } else if ($post["status"] == '') {
                    $response["message"] = "Status can't be blank.";
                } else {

                    $data = array(
                        'status' => $post['status'],
                        'updated_at' => $savetime,
                    );

                    $is_status_change = $this->db->update('tasks', $data, array('task_id' => $post['task_id']));

                    if ($is_status_change) {
                        $response["success"] = 1;
                        $response["message"] = "Task status is changed.";
                    } else {
                        $response["success"] = 0;
                        $response["message"] = "Oppss..! Something went wrong.";
                    }
                }
            }
        } else {
            $response["success"] = 0;
            $response["message"] = "Invalid URL";
        }

        echo json_encode($response);
    }

    public function user_list () {
        $post = $this->input->post();
        $savetime = time();

        $response["success"] = 0;
        $response["message"] = "";

        $list = $this->db->query("SELECT * FROM users")->result_array();

        if(!empty($list)) {
            foreach ($list as $i => $user) {
                $response['list'][$i]['user_id'] = $user['user_id'];
                $response['list'][$i]['name'] = $user['name'];
                $response['list'][$i]['contact_no'] = !empty($user['contact_no']) ? $user['contact_no'] : "";
                $response['list'][$i]['email'] = !empty($user['email']) ? $user['email'] : "";
                $response['list'][$i]['created_at'] = !empty($user['created_at']) ? date('d-m-Y', $user['created_at']) : "";
            }

            $response['success'] = '1';
            $response['message'] = 'User list found';

        }
        else {
            $response['success'] = '0';
            $response['message'] = 'No User found';
        }

        echo json_encode($response);

    }

}


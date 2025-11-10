<?php

class Admin_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function user_auth($data){
        $query = $this->db->get_where('admins', array('email' => $data['email'], 'password' => $data['password']));
        return $query->row_array();
    }

    public function save_task($data=[]) {
        if (!empty($data["task_id"])) {
            $data["updated_at"] = time();
            $this->db->where("task_id", $data["task_id"]);
            $save = $this->db->update("tasks", $data);
            
            if ($save) {
                $task_id = $data["task_id"];
            } else {
                $task_id = "";
            }
        } else {
            $save = $this->db->insert("tasks", $data);
            
            if ($save) {
                $task_id = $this->db->insert_id();
            } else {
                $task_id = "";
            }
        }

        return $task_id;
    }

}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/_service/admin.service';
import { ExcelService } from 'src/app/_service/excel.service';
import { PagerService } from 'src/app/_service/pager-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {

  constructor(private adminService: AdminService, private router: Router, private toastr: ToastrService, private pagerService: PagerService, private excelService: ExcelService, private route: ActivatedRoute
  ) { }

  dummyData = [1, 2, 3, 4, 5];
  isLoading: boolean = false;

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      const hasParams = Object.keys(params).length > 0;
      // Default API call when there are no query parameters (first load)
      if (!hasParams) {
        this.gettaskList();
        console.log('object');
      } else {
        this.taskObj.page = params['page'] ? Number(params['page']) : 1;
        this.taskObj.from_date = params['from'] ? params['from'] : '';
        this.taskObj.to_date = params['to'] ? params['to'] : '';
        // this.taskObj.status = params.hasOwnProperty('status') && params['status'].length > 0 ? params['status'] : '';
        // this.taskObj.search = params['search'] ? params['search'] : '';
        if (params['from'] && params['to']) {
          this.filters.date = {
            from_date: moment(new Date(params['from'])),
            to_date: moment(new Date(params['to']))
          };

          this.displayDates.start_time = moment(new Date(params['from'])).format('DD/MM/YYYY');
          this.displayDates.end_time = moment(new Date(params['to'])).format('DD/MM/YYYY');
        }
        this.gettaskList();
        // this.cdr.detectChanges();
        console.log('object');


      }
    });
  }

  taskList: any = [];

  taskObj: any = {
    page: 1,
    limit: 10,
    search: '',
    priority: '',
    status: '',
    total: 0,
    sort_by: '',
    sort_order: '',
    // category_id: '',
    from_date: '',
    to_date: '',
  }


  gettaskList() {
    this.isLoading = true;

    this.adminService.gettaskList(this.taskObj).subscribe(
      (response: any) => {
        if (response.success == 1) {
          this.taskList = response.list;
          this.taskObj.total = response.total;

          if (this.taskList.length > 0) {
            this.setUsersPage(this.taskObj.page, 0);
          }
        } else {
          this.taskList = [];
          this.taskObj.total = 0;
          // this.toastr.error(response.message);
        }
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      }
    )
  }

  onSearchChange() {
    this.taskObj.page = 1;
    this.gettaskList();
  }

  // changeStatus(item: any) {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     // text: "You won't be able to revert this!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#1eacee",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes"
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const payload = {
  //         id: item.id,
  //         is_active: item.is_active == '1' ? '0' : '1'
  //       };
  //       this.adminService.changeTaskStatus(payload).subscribe(
  //         (response: any) => {
  //           if (response.success == '1') {
  //             item.is_active = payload.is_active;
  //             this.toastr.success(response.message);
  //           } else {
  //             this.toastr.error(response.message);
  //           }
  //         }
  //       )
  //     }
  //   });
  // }

  listHoverIndex = null;
  changeHoverIndex(i: any) {
    this.listHoverIndex = i;
  }
  changeLeaveIndex() {
    this.listHoverIndex = null;
  }

  deleteItem(task_id: any) {
    Swal.fire({
      title: "Are you sure to delete?",
      // text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1eacee",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteTask({ task_id }).subscribe(
          (response: any) => {
            if (response.success == 1) {
              this.gettaskList();
            } else {
              this.toastr.error(response.message);
            }
          }
        )
      }
    });
  }

  onSearch() {
    this.taskObj.page = 1;
    this.gettaskList();
  }


  public usersPager: any = [];
  setUsersPage(page: number, flag: number) {
    this.usersPager = this.pagerService.getPager(this.taskObj.total, page, this.taskObj.limit);
    this.taskObj.page = this.usersPager.currentPage;

    this.router.navigate([], {
      queryParams: {
        page: this.taskObj.page
      },
      queryParamsHandling: 'merge', // This keeps existing query params
    });

    if (flag == 1) {
      this.gettaskList();
    }
  }


  // sorting 

  getOrderClass(field) {
    let className = "";
    if (this.taskObj.sort_by == field) {
      if (this.taskObj.sort_order == "asc") {
        className = "active-asc";
      } else {
        className = "active-desc";
      }
    }

    return className;
  }

  changeOrder(field) {
    this.taskObj.sort_by = field;
    this.taskObj.sort_order = (this.taskObj.sort_order == 'asc') ? "desc" : "asc";
    this.gettaskList();
  }
  // sorting 




  exportList: any = [];
  exportAsXLSX(): void {
    var i = 1; let t = this;
    var obj = [];

    let headers = [];
    const payload = {
      limit: 10000000,
      search: this.taskObj.search,
      status: this.taskObj.status,
      sort_by: this.taskObj.sort_by,
      sort_order: this.taskObj.sort_order,
    }
    this.adminService.gettaskList(payload).subscribe((response: any) => {
      if (response.success == 1) {
        this.exportList = response.list;

        this.exportList.map(function (a) {
          let exportData = {};

          exportData['Sr.No'] = i++;
          exportData['Assigned To'] = a.name;
          exportData['Status'] = a.status;
          exportData['Due Date'] = a.due_date_formatted;
          exportData['Priority'] = a.priority;
          exportData['Comments'] = a.comments ? a.comments : "";

          obj.push(exportData);
        });

        this.excelService.exportAsExcelFile(obj, headers, "Tasks");
      }
      else {
      }
    });
  }

  //For Date Filters //
  filters: any = {
    date: {
      from_date: "",
      to_date: "",
    }
  }

  public displayDates = {
    start_time: "",
    end_time: ""
  }

  removeDateRange() {
    this.router.navigate([], {
      queryParams: {
        'from': '',
        'to': '',
      },
      queryParamsHandling: 'merge', // This keeps existing query params
    });
    this.displayDates = {
      start_time: "",
      end_time: ""
    };

    this.filters.date = { from_date: "", to_date: "" };
    this.taskObj.from_date = "";
    this.taskObj.to_date = "";
    this.resetPagination();
    this.gettaskList();
  }

  ranges: any = {
    'All': [31516200, moment().subtract('days').endOf('day')],
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  }
  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];
  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some(d => d.isSame(m, 'day'))
  }
  datesChanges(range) {
    if (range.startDate && range.endDate) {
      this.displayDates.start_time = "";
      this.displayDates.end_time = "";

      this.taskObj.from_date = "";
      this.taskObj.to_date = "";

      this.displayDates.start_time = range.startDate.format('DD/MM/YYYY');
      this.displayDates.end_time = range.endDate.format('DD/MM/YYYY');

      this.taskObj.from_date = range.startDate.format('YYYY-MM-DD');
      this.taskObj.to_date = range.endDate.format('YYYY-MM-DD');

      this.resetPagination();
      this.gettaskList();
    }

  }

  setDateQuery(from_date, to_date) {
    if (from_date && to_date) {
      this.router.navigate([], {
        queryParams: {
          'from': from_date,
          'to': to_date,
        },
        queryParamsHandling: 'merge', // This keeps existing query params
      });
    }
    // console.log(this.categoryobj);
  }
  //For Date Filters //

  resetPagination() {
    this.taskObj.page = 1;
  }

  showModalF:boolean = false;
  closeModal() {
    this.showModalF = !this.showModalF;
    this.overlayObj = {
      task_id:'',
      status:''
    };
  }

  changeStatus(data:any) {
    this.showModalF = true;
    this.overlayObj.task_id = data.task_id;
    this.overlayObj.status = data.status;
  }

  overlayObj:any = {
    task_id:'',
    status:''
  };

  submitForm(form:any) {
    if(form.valid) {
      
      this.adminService.changeTaskStatus(this.overlayObj).subscribe((response) => {
        if(response.success == 1) {
          let task = this.taskList.find((item) => item.task_id == this.overlayObj.task_id);
          task.status = this.overlayObj.status;
          this.toastr.success(response.message, 'Success');
        }
        else {
          this.toastr.error(response.message, 'Error');
        }

        this.closeModal();
      })

    }
    else {
      this.toastr.error("Please fill all the required fields.");
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/_service/admin.service';

@Component({
  selector: 'app-task-add',
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.css']
})
export class TaskAddComponent implements OnInit {

  constructor(
    private adminService: AdminService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
  ) { }

  taskId: number;
  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.taskId = params["id"];
        this.gettaskDetails(this.taskId);
      }
    });
    
    this.getuserList();
  }

  detailObj = {};

  // editorData: any = '';
  configEditor = {
    versionCheck: false,
    removeButtons: "Print,Preview,NewPage,Source,Save,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Find,SelectAll,Scayt,Checkbox,TextField,Textarea,Radio,Form,Select,Button,ImageButton,HiddenField,Replace,CopyFormatting,Outdent,Indent,Blockquote,CreateDiv,BidiLtr,BidiRtl,Language,Anchor,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Maximize,ShowBlocks,About,FontSize",
    toolbarGroups: [
      { name: "document", groups: ["mode", "document", "doctools"] },
      { name: "editing", groups: ["find", "selection", "spellchecker", "editing"] },
      { name: "basicstyles", groups: ["basicstyles", "cleanup"] },
      { name: "styles", groups: ["styles"] },
      { name: "paragraph", groups: ["list", "indent", "blocks"] },
      "/",
      { name: "clipboard", groups: ["clipboard", "undo"] },
      { name: "paragraph", groups: ["align", "bidi", "paragraph"] },
      { name: "forms", groups: ["forms"] },
      { name: "links", groups: ["links"] },
      { name: "colors", groups: ["colors"] },
      { name: "insert", groups: ["insert", "media"] }, // Enable Insert group
      "/",
      { name: "tools", groups: ["tools"] },
      { name: "others", groups: ["others"] },
      { name: "about", groups: ["about"] },
    ],
    // filebrowserUploadUrl: environment.api + 'imageUpload/uploadImages/',
  };

  isLoading: boolean = false;

  submitForm(form) {
    if (form.valid) {
      this.isLoading = true;

      this.adminService.savetask(this.detailObj).subscribe((response: any) => {
        if (response.success == 1) {
          this.toastr.success(response.message);
          this.router.navigate(['/tasks']);
        } else {
          this.toastr.error(response.message);
        }
        this.isLoading = false;

      })
    }

  }

  gettaskDetails(id: any) {
    if (id) {

      let payload = {
        task_id: id
      }

      this.adminService.gettaskList(payload).subscribe(
        (response: any) => {
          if (response.success == 1) {
            this.detailObj = response.list[0];
          } else {
            this.toastr.error(response.message);
          }
        }
      );
    }
  }
  
  user_list = [];
  getuserList() {
    this.adminService.getuserList({}).subscribe(
      (response: any) => {
        if (response.success == 1) {
          this.user_list = response.list;
        } 
        else {
          this.user_list = [];
          this.toastr.error(response.message);
        }
      }
    );
  }

}

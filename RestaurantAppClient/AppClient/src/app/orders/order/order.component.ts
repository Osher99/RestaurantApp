import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/shared/order.service';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { OrderItemsComponent } from '../order-items/order-items.component';
import { CustomerService } from 'src/app/shared/customer.service';
import { Customer } from 'src/app/shared/customer.model';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styles: []
})
export class OrderComponent implements OnInit {
  customerList: Customer[];
  isValid = true;

  constructor(private service: OrderService,
              private dialog: MatDialog,
              private customerService: CustomerService,
              private toastrService: ToastrService,
              private router: Router,
              private currentRoute: ActivatedRoute
    ) {
  }

  ngOnInit() {
    const orderID = this.currentRoute.snapshot.paramMap.get('id');
    if (orderID == null) {
      this.resetForm();
    } else {
      // tslint:disable-next-line: radix
      this.service.getOrderByID(parseInt(orderID)).then((res) => {
        this.service.formData = res.order;
        this.service.formData.DeletedOrderItemIDs = '';
        this.service.orderItems = res.orderDetails;
        console.log(this.service.formData);
        console.log(this.service.orderItems);

      });
    }

    this.customerService.getCustomerList().then(
      (res) => {
        this.customerList = res as Customer[];
      }).catch((err) => {
        console.log(err);
      });
  }

  resetForm(form?: NgForm) {
    if (form != null) {
    form.resetForm();
    }
    this.service.formData = {
      OrderID: null,
      OrderNo: Math.floor(100000 + Math.random() * 900000).toString(),
      CustomerID: 0,
      PMethod: '',
      GTotal: 0,
      DeletedOrderItemIDs: ''
    };
    console.log(this.service.formData);
    this.service.orderItems = [];
  }

AddOrEditOrderItem(orderItemIndex, OrderID) {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.autoFocus = true;
  dialogConfig.disableClose = true;
  dialogConfig.width = '50%';
  dialogConfig.data = {
    orderItemIndex,
    OrderID
  };
  this.dialog.open(OrderItemsComponent, dialogConfig).afterClosed().subscribe(
    res => {
      this.updateGrandTotal();
    }
  );
}

onDeleteOrderItem(OrderItemID: number, i: number) {
  if (OrderItemID != null) {
    console.log(this.service.formData.DeletedOrderItemIDs);
    this.service.formData.DeletedOrderItemIDs += OrderItemID + ',';
    this.service.orderItems.splice(i, 1);
    this.updateGrandTotal();
}
 }


updateGrandTotal() {
  this.service.formData.GTotal = this.service.orderItems.reduce((prev, curr) => {
   return prev + curr.Total;
  }, 0);
  this.service.formData.GTotal = parseFloat(this.service.formData.GTotal.toFixed(2));
}

validateForm() {
  this.isValid = true;
  if (this.service.formData.CustomerID === 0) {
    this.isValid = false;
  } else if (this.service.orderItems.length === 0) {
    this.isValid = false;
  }  else if (this.service.formData.PMethod === '') {
    this.isValid = false;
  }
  return this.isValid;
}

onSubmit(form: NgForm) {
  if (this.validateForm()) {
    this.service.saveOrUpdateOrder().subscribe(res => {
      this.resetForm();
      this.toastrService.success('Order Submitted Successfully!', 'Success');
      this.router.navigate(['/orders']);
    });
  } else {
  this.toastrService.info('Order lacks information! Please check the order!', 'Info');
}
}
}

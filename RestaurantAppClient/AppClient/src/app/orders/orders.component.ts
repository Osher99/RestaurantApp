import { Component, OnInit } from '@angular/core';
import { OrderService } from '../shared/order.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styles: []
})
export class OrdersComponent implements OnInit {
  orderList;

  constructor(private orderService: OrderService,
              private router: Router,
              private toastrService: ToastrService
              ) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.orderService.getOrderList().then((res) => {
      this.orderList = res;
    }).catch((err) => console.log(err));
  }

  openForEdit(orderID: number) {
    this.router.navigate(['/order/edit/' + orderID]);
  }

  onOrderDelete(id) {
    if (confirm('Are you sure you want to delete this order?')) {
    this.orderService.deleteOrder(id).then(() => {
      this.refreshList();
      this.toastrService.success('Successfully deleted order', 'Success Delete');
    });
  }
  }

}

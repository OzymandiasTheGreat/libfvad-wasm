import { Component, OnInit, NgZone } from "@angular/core";
import { check, request } from "@nativescript-community/perms";


@Component({
  selector: "ns-app",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
	private worker: Worker;
	message: string;

	constructor(private zone: NgZone) { }

	ngOnInit(): void {
		check("microphone").then(([status]) => {
			switch (status) {
				case "authorized":
					this.listen();
					break;
				default:
					request("microphone").then(([response]) => {
						switch (response) {
							case "authorized":
								this.listen();
								break;
						}
					});
			}
		});
	}

	listen(): void {
		this.worker = new Worker("./recorder.worker.ts");
		this.worker.postMessage("START");
		this.worker.onmessage = (msg: MessageEvent) => {
			console.log(msg.data);
			this.zone.run(() => this.message = msg.data);
		};
	}
}

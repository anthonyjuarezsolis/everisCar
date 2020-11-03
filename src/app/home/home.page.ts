import { Component } from "@angular/core";
import {
  CameraPreview,
  CameraPreviewOptions,
} from "@ionic-native/camera-preview/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";

import { HttpClient } from "@angular/common/http";
import { AlertController } from "@ionic/angular";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  isToBack = false;
  imageData: any;
  IMAGE_PATH: string;
  width: number;
  height: number;
  dataCart: any;
  imageBlob: File;
  detailCar: any;
  placa: any;
  color: any;
  modelo: any;
  tipo: any;
  año: any;
  marca: any;

  constructor(
    private cameraPreview: CameraPreview,
    private statusBar: StatusBar,
    private http: HttpClient,
    public alertController: AlertController,
    public splashScreen: SplashScreen
  ) {
    let cameraPreviewOpts: CameraPreviewOptions = {
      x: 20,
      y: 20,
      width: 50,
      height: 50,
      camera: "rear",
      tapPhoto: true,
      previewDrag: true,
      toBack: true,
      alpha: 1,
    };

    this.cameraPreview.startCamera(cameraPreviewOpts);
    this.statusBar.backgroundColorByHexString("#9aae04");
    this.statusBar.styleLightContent();
    this.splashScreen.hide();
  }

  startCameraAbove() {
    this.cameraPreview.stopCamera().then(() => {
      this.isToBack = false;
      this.cameraPreview.startCamera({
        x: 80,
        y: 450,
        width: 250,
        height: 300,
        toBack: false,
        previewDrag: true,
        tapPhoto: true,
      });
    });
  }

  startCameraBelow() {
    this.cameraPreview.stopCamera().then(() => {
      this.isToBack = true;
      this.cameraPreview.startCamera({
        x: 0,
        y: 50,
        width: window.screen.width,
        height: window.screen.height,
        camera: "rear",
        tapPhoto: true,
        previewDrag: false,
        toBack: true,
      });
    });
  }

  switchCamera() {
    this.cameraPreview.switchCamera();
  }

  takePicture() {
    this.cameraPreview
      .takePicture({
        width: 1280,
        height: 1280,
        quality: 85,
      })
      .then(
        (imageData) => {
          this.imageData = imageData[0];
          this.IMAGE_PATH = "data:image/jpeg;base64," + imageData;
          this.postMethod(this.IMAGE_PATH);
        },
        (err) => {
          alert(err);
        }
      );
  }

  //funcion para transformar de base64 a blob
  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  postMethod(image: any) {
    console.log("se envio al servicio de placa");
    let urlApi =
      "https://api.openalpr.com/v2/recognize?recognize_vehicle=1&country=us&secret_key=sk_6035d3a8f43691c4bb2be27e";
    let formData = new FormData();
    let imageB = image;
    this.imageBlob = this.dataURLtoFile(imageB, "foto.jpg");
    formData.append("image", this.imageBlob, "foto.jpg");
    this.http.post(urlApi, formData).subscribe((value) => {
      this.dataCart = value;
      console.log(this.dataCart);
      this.detailCar = this.dataCart.results[0].vehicle;
      this.placa = this.dataCart.results[0].plate;
      this.color = this.detailCar.color[0].name;
      this.marca = this.detailCar.make[0].name;
      this.modelo = this.detailCar.body_type[0].name;
      this.tipo = this.detailCar.make_model[0].name;
      this.año = this.detailCar.year[0].name;

      this.presentAlert();
    });
    return false;
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: "my-custom-class",
      header: "Resultado",
      mode: "ios",
      subHeader: "Detalles de la imagen",
      message:
        "<strong>Placa: </strong>" +
        this.placa +
        "<br>" +
        "<strong>Color: </strong>" +
        this.color +
        "<br>" +
        "<strong>Marca: </strong>" +
        this.marca +
        "<br>" +
        "<strong>Tipo: </strong>" +
        this.tipo +
        "<br>" +
        "<strong>Modelo: </strong>" +
        this.modelo +
        "<br>" +
        "<strong>Año: </strong>" +
        this.año +
        "<br>",
      buttons: ["Cerrar"],
    });

    await alert.present();
  }
}

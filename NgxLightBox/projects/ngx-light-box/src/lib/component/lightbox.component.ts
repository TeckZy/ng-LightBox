import * as PhotoSwipe from 'photoswipe';
import * as PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';
import * as imagesloaded_ from 'imagesloaded';
const IL = imagesloaded_;
import {
	Component,
	ViewEncapsulation,
	Input,
	Output,
	EventEmitter,
	ChangeDetectorRef,
	Inject,
	PLATFORM_ID,
	OnChanges,
	ViewChild,
	OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Image } from './../models/image.model';
import { PhotoswipeImage } from '../models/photoswipe-image.model';
import { NgxLightboxService } from './../service/lightbox.service';
import { NgxLightBoxDirective } from './../directive/ngxLightBox.directive';

@Component({
	selector: 'ngx-lightbox',
	templateUrl: './lightbox.component.html',
	styleUrls: ['../style/lightbox.style.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class NgxLightboxComponent implements OnChanges, OnDestroy {
	@Input('galleryKey') galleryKey: string;
	@ViewChild('NgxLightBox', { static: false })
	directiveRef?: NgxLightBoxDirective;
	@Output('imagesLoaded') imagesLoaded: EventEmitter<
		number
	> = new EventEmitter();
	isBrowser: boolean;
	key: any;
	image: any;
	subscription;
	constructor(
		private lbService: NgxLightboxService,
		private ref: ChangeDetectorRef,
		@Inject(PLATFORM_ID) platformId: string,
	) {
		ref.detach();
		this.isBrowser = this.isBrowser = isPlatformBrowser(platformId);
		this.subscription = this.lbService.ls.subscribe(index => {
			this.openImage(index);
		});
	}

	ngOnChanges(): void {
		this.ref.detectChanges();
		if (this.isBrowser) {
			this.checkImageLoad();
		}
	}
	openImage(index): boolean {
		this.openPhotoSwipe(
			index,
			document.getElementsByClassName('ngx_photoswipe')[0],
		);

		return false;
	}

	getImages(): Array<Image> {
		return this.lbService.getImages(this.galleryKey);
	}

	private checkImageLoad(): void {
		IL(`#${this.galleryKey}`, (check: any) => {
			this.imagesLoaded.emit(check.images.length);
		});
	}

	private openPhotoSwipe(index: number, galleryDOM: any): boolean {
		const options: PhotoSwipe.Options = {};
		options.galleryUID = galleryDOM.getAttribute('data-pswp-uid');
		options.index = index ? index : 0;
		const PSWP: HTMLElement = document.querySelectorAll(
			'.pswp',
		)[0] as HTMLElement;
		new PhotoSwipe(
			PSWP,
			PhotoSwipeUI_Default,
			this.getImagesAsPhotoswipe(),
			options,
		).init();
		setInterval(() => {
			console.log(this.directiveRef);
		}, 1000);

		return false;
	}

	private getImagesAsPhotoswipe(): Array<PhotoswipeImage> {
		const items: Array<PhotoswipeImage> = [];
		items.length = 0;

		this.lbService
			.getImages(this.galleryKey)
			.forEach(function f(img): void {
				items.push(
					new PhotoswipeImage(img.largeUrl, img.width, img.height),
				);
			});

		return items;
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}

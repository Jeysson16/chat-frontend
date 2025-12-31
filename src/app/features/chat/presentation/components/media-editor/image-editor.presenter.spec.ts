import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageEditorPresenter } from './image-editor.presenter';

function makePngFile(): Promise<File> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#00f';
    ctx.fillRect(0,0,16,16);
    canvas.toBlob(blob => {
      const file = new File([blob!], 'test.png', { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}

describe('ImageEditorPresenter', () => {
  let component: ImageEditorPresenter;
  let fixture: ComponentFixture<ImageEditorPresenter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageEditorPresenter],
    }).compileComponents();
    fixture = TestBed.createComponent(ImageEditorPresenter);
    component = fixture.componentInstance;
  });

  it('emite archivo editado al aplicar', async () => {
    const file = await makePngFile();
    component.file = file;
    fixture.detectChanges();
    const spy = jasmine.createSpy('edited');
    component.edited.subscribe(spy);
    await new Promise(r => setTimeout(r, 50));
    component.emitEdited();
    await new Promise(r => setTimeout(r, 50));
    expect(spy).toHaveBeenCalled();
  });
});

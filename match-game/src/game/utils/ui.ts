import { touchBtnAction } from "./anim";


export function popTipBox(self: any , title : string ,text : string, name : string, nameBtn : string) {
    // bg
    const color1 = new Phaser.Display.Color(0, 0, 0);
    const rect1 = self.add.rectangle(0, 0, 750*2, 1334*2, color1.color,80);

    // box
    const titleText = self.add.text(750 / 2, 1334 / 2 - 220, title, { fontFamily: 'Arial', color: '#ffffff' })
        .setFontSize(40).setStroke('#387f11', 8).setOrigin(0.5,0.5);

    const tipText = self.add.text(750 / 2, 1334 / 2 + 60, text, { fontFamily: 'Arial', color: '#ffffff' })
        .setFontSize(40).setStroke('#387f11', 8).setOrigin(0.5,0.5);
    const bg = self.add.nineslice(750 / 2, 1334 / 2, 228*2, 318*2, name, [15, 15, 15, 15]).setOrigin(0.5,0.5);

    // close
    const closeBtn = self.add.nineslice(750 / 2, 1334 / 2 + 300 , 200, 80, nameBtn, [15, 15, 15, 15]).setOrigin(0.5,0.5);
    const closeText = self.add.text(750 / 2, 1334 / 2+ 300, 'close', { fontFamily: 'Arial', color: '#ffffff' })
        .setFontSize(40).setStroke('#387f11', 8).setOrigin(0.5,0.5);
    closeBtn.setInteractive();
    closeBtn.on('pointerdown', () =>
        {
            touchBtnAction(self,closeBtn,()=>{
                //
                container.destroy();
                //
            });
        });

    // button


    const container = self.add.container(0, 0, [rect1,bg,titleText,tipText,closeBtn,closeText]);
}
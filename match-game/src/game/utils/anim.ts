// tools
export function touchBtnAction(self: any,targets : any,callback: any){
    targets.disableInteractive();
    // 创建放大的补间动画
    zoom(self,targets,1.2);
    // 设置延迟还原
    timeRun(self,100,()=>{
        zoom(self,targets,1);
        timeRun(self,100,()=>{
            targets.setInteractive();
            callback();
        });
    });
    //
}

export function zoom(self: any,targets : any,scale : number){
    self.tweens.add({
        targets: targets,
        scaleX: scale,
        scaleY: scale,
        ease: 'Power1', // 缩放动画的缓动函数
        duration: 100 // 动画持续时间100毫秒
    });
}

export function timeRun(self: any,delay: number,callback: any,data?:any){
    self.time.addEvent({
        delay: delay, // 延迟100毫秒
        callback: () => {
            callback(data);
        },
        loop: false
    });
}
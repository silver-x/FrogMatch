// 
export function randomInt(max:number) {
    const random = Math.trunc(Math.random()*max);
    return random;
}

export function randomInt2(min:number,max:number) {
    const random = Math.trunc(Math.random()*(max-min)) + min;
    return random;
}

// set layer show
export function setActive(container:any,flag:boolean){
    container.setActive(flag);
    container.setVisible(flag);
}
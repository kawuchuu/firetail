onmessage = (a) => {
    let selectOptions = a.data[3];
    let settingsListGet = a.data[4];
    let iconstyle = a.data[2];
    function createSwitch(i) {
        return `<div class="label-switch"><div><p>${i.title}</p><div class="switch-desc">${i.desc}</div></div><label class="switch"><input id="${i.id}" type="checkbox"><span class="switch-slider round"></span></label></div>`
    }

    function createSubmenuButton(i) {
        return `<div class="menu-submenu-button" id="${i.id}"><div class="subbutton-name"><i class="material-icons material-icons-${iconstyle}">${i.icon}</i><p>${i.title}</p></div><i class="material-icons">keyboard_arrow_right</i></div>`
    }

    function createSelectList(i) {
        let addOption = [];
        i.options.forEach((f) => {
            let selected = '';
            optionInfo = f.option;
            if (selectOptions[i.id]) {
                if (settingsListGet[selectOptions[i.id]] == optionInfo.value) {
                    selected = 'selected'
                }
            }
            addOption.push(`<option ${selected} value="${optionInfo.value}">${optionInfo.title}</option>`)
            addOption.join();
        })
        return `<div class="select-list" id="${i.id}List"><div><p>${i.title}</p><div class="switch-desc">${i.desc}</div></div><div class="select-container"><select id="${i.id}">${addOption}</select></div></div>`
    }

    function createRegularButton(i) {
        return `<div class="menu-regular-button" id="${i.id}"><div><p>${i.title}</p><div class="switch-desc">${i.desc}</div>`
    }
    let e = a.data[0];
    let o;
    if (a.data[1]) {
        o = a.data[1];
    }
    let firstMenu = false;
    let switches = [];
    let options = [];
    let id;
    let optionInfo;
    let topElement;

    let addToMenu = [];
    e[0].controls.forEach((f, i) => {
        let newControl;
        let buttonType = Object.keys(f)[0];
        switch (buttonType) {
            case 'switch':
                newControl = createSwitch(e[0].controls[i].switch);
                switches.push(e[0].controls[i].switch.id)
                break;
            case 'subButton':
                newControl = createSubmenuButton(e[0].controls[i].subButton);
                id = e[0].controls[i].subButton.id;
                break;
            case 'customHTML':
                newControl = `<div class="customHTML">${e[0].controls[i].customHTML}</div>`;
                break;
            case 'select':
                newControl = createSelectList(e[0].controls[i].select);
                break;
            case 'button':
                newControl = createRegularButton(e[0].controls[i].button);
                switches.push(e[0].controls[i].button.id)
        }
        if (o) {
            firstMenu = true;
        }
        addToMenu.push(newControl);
    });
    postMessage([addToMenu, switches, firstMenu]);
}
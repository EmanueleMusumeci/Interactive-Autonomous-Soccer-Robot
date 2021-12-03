/*
This file contains all the functions used for the web page responsiveness
*/

function openTab(e, tabName) {
    for (tab of document.getElementsByClassName("settings-tab")) {
    tab.style.display = "none";
    }

    for (tab_button of document.getElementsByClassName("settings-tab-button")) {
    tab_button.className = tab_button.className.replace(" active", "");
    }

    //scan for active buttons in sub tab header
    
    var activeButton=false;
    subTabsHeader = subTabButtons = document.getElementById(tabName).getElementsByClassName("settings-sub-tabs-header")

    //If there are sub tabs and no sub tab has been opened yet, click the default sub tab for this tab
    if(subTabsHeader.length!=0){
        subTabButtons = subTabsHeader[0].getElementsByTagName("button")
        if(subTabButtons.length>0)
        {
            //console.log(subTabButtons)
            for(var button of subTabButtons)
            {
                //console.log(button)
                if(button.className.includes("active"))
                {
                    activeButton = true;
                }
            }
        }
        //console.log(activeButton)
        if(!activeButton)
        {
            var currentTab = document.getElementById(tabName);
            if(currentTab.hasOwnProperty('defaultTabButton')) 
            {
                //console.log(currentTab.defaultTabButton)
                currentTab.defaultTabButton.click();
            }
        }
    }


    document.getElementById(tabName).style.display = "flex";
    if(document.getElementById(tabName).hasOwnProperty("defaultTabButton")) document.getElementById(tabName).defaultTabButton.click();
    
    e.currentTarget.className += " active";
}

function openSubTab(e, tabName) {
    for (tab of document.getElementsByClassName("settings-sub-tab")) {
    tab.style.display = "none";
    }

    for (tab_button of e.target.parentElement.getElementsByTagName("button")) {
    tab_button.className = tab_button.className.replace(" active", "");
    }

    //scan for active buttons in sub-sub tab header
    var activeButton=false;
    subTabButtons = document.getElementById(tabName).querySelectorAll(".settings-sub-tabs-header > button")
    if(subTabButtons.length>0)
    {
        //console.log(subTabButtons)
        for(var button of subTabButtons)
        {
            //console.log(button)
            if(button.className.includes("active"))
            {
                activeButton = true;
            }
        }
    }
    //console.log(activeButton)
    if(!activeButton)
    {
        var currentTab = document.getElementById(tabName);
        if(currentTab.hasOwnProperty('defaultTabButton')) currentTab.defaultTabButton.click();
    }

    document.getElementById(tabName).style.display = "flex";
    //console.log(tabName)
    //console.log(document.getElementById(tabName).defaultTabButton)
    if(document.getElementById(tabName).hasOwnProperty("defaultTabButton")) document.getElementById(tabName).defaultTabButton.click();
    e.currentTarget.className += " active";
}

function openSubSubTab(e, tabName) {
    for (tab of document.getElementsByClassName("settings-sub-sub-tab")) {
        //console.log(tab)
    tab.style.display = "none";
    }

    for (tab_button of e.target.parentElement.getElementsByTagName("button")) {
        //console.log(tab_button)
        tab_button.className = tab_button.className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "flex";
    e.currentTarget.className += " active";
}

/*function updateLabel(e, labelName, value){
    var label;
    if(labelName==undefined)
    {
        label = e.target.label;        
    }
    else
    {
        if(e.target.firstLabel!=undefined && e.target.firstLabel.id.includes(labelName)) label = e.target.firstLabel;
        else if(e.target.secondLabel!=undefined && e.target.secondLabel.id.includes(labelName)) label = e.target.secondLabel;
    }
    //console.log(label)
    if(value==undefined)
    {
        label.innerHTML = label.baseString + ": "+e.target.value;
    }
    else
    {
        //print(label)
        label.innerHTML = label.baseString + ": "+value;
    }
};*/

/*function updateLabelFromElement(e, labelName, value){
    var label;
    if(labelName==undefined)
    {
        label = e.label;        
    }
    else
    {
        if(e.firstLabel!=undefined && e.firstLabel.id.includes(labelName)) label = e.firstLabel;
        else if(e.secondLabel!=undefined && e.secondLabel.id.includes(labelName)) label = e.secondLabel;
    }
    //console.log(label)
    if(value==undefined)
    {
        label.innerHTML = label.baseString + ": "+e.value;
    }
    else
    {
        //print(label)
        label.innerHTML = label.baseString + ": "+value;
    }
};

function updateColorPreview(e, color, slider) 
{
    var rgbToHex = function(rgba_array) {
        hexColors = []
        for(var i=0;i<rgba_array.length-1; i+=1)
        {
            var rescaled_value = parseInt(rgba_array[i]/2 * 254); 
            hexColors[i] = rescaled_value.toString(16);
            if(hexColors[i].length<2)
            {
                hexColors[i] = "0" + hexColors[i];
            }
        }
        var colorString = "#"+hexColors[0]+hexColors[1]+hexColors[2]
        return colorString;
    };
    var preview;
    if(slider==undefined)
    {
        preview = e.target.parentElement.parentElement.parentElement.querySelector(".colorPreview");
    }
    else
    {
        preview = document.getElementById(slider).parentElement.parentElement.parentElement.querySelector(".colorPreview");
    }
    //console.log(preview)
    //console.log(rgbToHex(color))
    preview.style.backgroundColor = rgbToHex(color);
}*/

function toggleButton(targetButton){
    if(targetButton.hasAttribute("noToggle")) return;
    if(targetButton.className.includes("active"))
    {
        targetButton.className = targetButton.className.replace(" active", "")
    }
    else targetButton.className += " active";

    for (button of targetButton.parentElement.getElementsByTagName("button")) {
    if (button.id!=targetButton.id){
        button.className = tab_button.className.replace(" active", "");
    }
    }

    if(targetButton.innerHTML.includes(" ON"))
    {
        targetButton.innerHTML = targetButton.innerHTML.replace(" ON", " OFF")
    } else if(targetButton.innerHTML.includes(" OFF"))
    {
        targetButton.innerHTML = targetButton.innerHTML.replace(" OFF", " ON")
    }

    if(targetButton.innerHTML.includes("Pause"))
    {
        targetButton.innerHTML = targetButton.innerHTML.replace("Pause", "Resume")
    } else if(targetButton.innerHTML.includes("Resume"))
    {
        targetButton.innerHTML = targetButton.innerHTML.replace("Resume", "Pause")
    }
};


function initializeSliders() {
    //print(defaultSliderValues)
    for(var [sliderID,sliderValue] of defaultSliderValues)
    {
        document.getElementById(sliderID).value = sliderValue;
        //print(sliderID+": "+document.getElementById(sliderID).value)
        if(document.getElementById(sliderID).hasOwnProperty("label"))
        {
            updateLabelFromElement(document.getElementById(sliderID));   
        }
    }
}

function initializeButtons() {
    for(var [buttonID,buttonValue] of defaultButtonValues)
    {
        if(buttonValue)
        {
            document.getElementById(buttonID).className += " active";
            //print(buttonID+": "+document.getElementById(buttonID).value)
        }
    }
}
initializeButtons();

/*var inputs = document.getElementsByTagName("input");
for(elem of inputs)
{
    var parentLabels = elem.parentElement.getElementsByTagName("label")
    if(parentLabels.length==1)
    {
        label = parentLabels[0];
        if(label.hasAttribute("noUpdate")) continue;
        elem.label = label;
        label.baseString = label.innerHTML;
        label.innerHTML = label.baseString + ": "+elem.value;
    }
    else if(parentLabels.length==2)
    {
        var parentLabels = elem.parentElement.getElementsByTagName("label")
        //print(parentLabels)
        elem.firstLabel = parentLabels[0];
        //print(parentLabels[0])
        elem.secondLabel = parentLabels[1];
        elem.firstLabel.baseString = elem.firstLabel.innerHTML;
        elem.firstLabel.innerHTML = elem.firstLabel.baseString + ": "+elem.value;
        elem.secondLabel.baseString = elem.secondLabel.innerHTML;
        elem.secondLabel.innerHTML = elem.secondLabel.baseString + ": "+elem.value;
    }
}*/

initializeSliders();

//document.getElementById("simple-tasks-tab").defaultTabButton = document.getElementById("BUTTON_NAME")

document.getElementById("default-tab-button").click();

//Click events for buttons to change texture
/*
for(var button of document.getElementsByClassName("Button_ChooseTexture"))
{
    button.onclick=function(e) {
        if(e.target.className!="Button_ChooseTexture")
        {
            return;
        }
        //console.log(e.target.className)
        //This prevents from propagating the click event to the file input element (thus executing the function a second time on the wrong element)
        e.target.getElementsByClassName("uploadTexture")[0].click();
    }
    button.getElementsByClassName('uploadTexture').label = button.parentElement.getElementsByClassName("textureFileName")[0];
}

for(let label of document.getElementById("bear-texture-tab").getElementsByTagName("label"))
{
    label.innerHTML = label.parentElement.parentElement.getElementsByTagName("img")[0].src.split(/(\\|\/)/g).pop();
}

for(let label of document.getElementById("tree-texture-tab").getElementsByTagName("label"))
{
    label.innerHTML = label.parentElement.parentElement.getElementsByTagName("img")[0].src.split(/(\\|\/)/g).pop();
}
*/
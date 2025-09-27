class ComponentLoader{ // main class component manager
    constructor(){ // constructor executing when new object is creating
        this.components={}; // creating object for storing loaded components
        // key: component name, value: html code of component
    }
    async loadComponent(name){ // async func for loading components from file
        if(this.components[name]){ // if component already loaded in cache
            return this.components[name]; // return that component
        }
        try{ // if not - loading from server
            const response = await fetch(`components/${name}.html`); // fetch send HTTP communication to server
            // await - waiting for communication finishing
            // components/${name}.html = path to file ex. components/header.html
            const html = await response.text(); // changing response to HTML text
            return html;
        }
        catch(error){ // raising error if component doesn't exist or have diff name
            console.error(`Error loading component ${name}:`, error);
            return `<div>Error loading ${name}</div>`;
        }
    }
    async renderComponent(containerId, componentName, params = {}){ // rendering in exect page element
        const container = document.getElementById(containerId); // finding DOM elem by using ID where we want to put in component
        //document.getElementById searching elem by id
        if(!container){ // if container doesn't exist
            console.error(`Container ${containerId} not found`); // raising error
            return;
        }
        let html = await this.loadComponent(componentName); // loading component from file or cache
        html = this.replaceParams(html, params); // changing placeholders {{}} to parameters
        container.innerHTML = html; // changing inner HTML in element to new HTML

        this.executeScripts(container); // exec scripts in component with this container
        this.attachButtonEvents(container); // exec scripts to deal with buttons
    }
    replaceParams(html, params){
        console.log("replaceParams called");
        console.log("HTML before: ", html);
        console.log("Params", params);
        const result =  html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            console.log("Find placeholder: ", match, "Key: ", key);
            // REGEX that looking for match {{}}
            // \{\} looking for {{
            // (\w+) catching some words between\
            // \}\} looking for }}
            // /g - global flag
            // -----------------------------------
            // for every founded {{}}:
            // 'match' - it's all text ex. {{text}}
            // 'key' - catched name ex. "text"
            const value = params[key] || match;
            console.log("Replacing with: ", value);
            return value;
            // if key = "text" - params["text"] returns "Python" 
            // if key is undefined - return original {{name}}
            
        });
        console.log("HTML after: ", result);
        return result;
    }

    executeScripts(container){ // func to exec script finded in component
        const scripts = container.querySelectorAll('script'); // searching every element <script> inisde every component
        // querySelectorAll return list of all components that have script element
        scripts.forEach(script => { // for each script that was founded
            const newScript = document.createElement('script'); // creating new element script
            if(script.src){ // checking if script elem has src atrybut(loading outer file)
                newScript.src = script.src; // if yes - coping path to file
            }
            else{ // if not
                newScript.textContent = script.textContent; // coping javascript code inside tag
            }
            document.head.appendChild(newScript); // add new script to <head>
            // and after that script will executing
        });
    }
    attachButtonEvents(container){
        const testElemet = document.getElementById('skills-py');
        if (testElemet){
            const paramsJson = testElemet.getAttribute('data-params');
            console.log("Params JSON: ", paramsJson);

            try{
                const testParams = JSON.parse(paramsJson);
                console.log("JSON parsed: ", testParams);
            }
            catch(e){
                console.error("TEST PARSE ERROR: ", e);
            }
        }
        const buttons = container.querySelectorAll('.icon-button'); // looking for all .icon-button components
        // and returns NodeList of elements
        buttons.forEach(button => { // for each button in NodeList
            button.addEventListener('click', function(){ // add Listener click to button
                this.classList.toggle('active'); // if button in active - disactivate it
                // if not - activate it
                const action = this.getAttribute('data-action'); // get data-action attrybute value
                // if data-action="python" returns python
                if(action){ // if action exists - write down on console that button was clicked
                    console.log('Button clicked: ', action);
                }
            })
        })
    }
    
}

window.componentLoader = new ComponentLoader(); //Global init of ComponentLoader class
// window.ComponentLoader make object visible in browser
document.addEventListener('DOMContentLoaded', function(){ // waiting for DOMContentLoaded event which will fire when page has been loaded
    const components = document.querySelectorAll('[data-component]'); // searching for every component that has data-component attribute
    // data-component HTML5 attribute that contains data
    // ex. <div data-component="header"></div>
    components.forEach(async (element) => { // for each founded object
        const componentName = element.getAttribute('data-component'); // get component name from data-component attribute
        await window.componentLoader.renderComponent(element.id, componentName); // rendering component inside element
        // await waiting for component for loading and rendering 
    });
});
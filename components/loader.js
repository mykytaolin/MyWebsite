class ComponentLoader{ // main class component manager
    constructor(){ // constructor executing when new object is creating
        this.components={}; // creating object for storing loaded components
        // key: component name, value: html code of component
    }
    async LoadComponent(name){ // async func for loading components from file
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
    async RenderComponent(containerId, componentName){ // rendering in exect page element
        const container = document.getElementById(containerId); // finding DOM elem by using ID where we want to put in component
        //document.getElementById searching elem by id
        if(!container){ // if container doesn't exist
            console.error(`Container ${containerId} not found`); // raising error
            return;
        }
        const html = await this.LoadComponent(componentName); // loading component from file or cache
        container.innerHTML = html; // changing inner HTML in element to new HTML

        this.executeScripts(container); // exec scripts in component with this container
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
}

window.ComponentLoader = new ComponentLoader(); //Global init of ComponentLoader class
// window.ComponentLoader make object visible in browser
document.addEventListener('DOMContentLoaded', function(){ // waiting for DOMContentLoaded event which will fire when page has been loaded
    const components = document.querySelectorAll('[data-component]'); // searching for every component that has data-component attribute
    // data-component HTML5 attribute that contains data
    // ex. <div data-component="header"></div>
    components.forEach(async (element) => { // for each founded object
        const componentName = element.getAttribute('data-component'); // get component name from data-component attribute
        await window.ComponentLoader.RenderComponent(element.id, componentName); // rendering component inside element
        // await waiting for component for loading and rendering 
    });
});
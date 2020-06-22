import React, {
    Component
} from 'react'

export default class Shortener extends Component {
    constructor() {
        super();
        this.state = {
            urlEmpty: false,
            slugEmpty: false,
            data: {
                url: "",
                slug: ""
            }
        }
    }

    urlChanged(component, evt) {
        component.setState({
            data: {
                url: evt.target.value,
                state: component.state.data.state,
            },
            urlEmpty: evt.target.value === ""
        });
    }

    slugChanged(component, evt) {
        component.setState({
            data: {
                url: component.state.data.url,
                slug: evt.target.value
            },
            slugEmpty: evt.target.value === ""
        });
        let lbl = document.getElementById('txtLbl');
        lbl.innerText = "New link: https://bestsong.co.uk/" + evt.target.value;
        lbl.classList.remove('err');
        lbl.classList.remove('success');
    }
    async submit(component) {
        let data = component.state.data;
        component.setState({
            urlEmpty: data.url === ""
        });
        component.setState({
            slugEmpty: data.slug === ""
        });
        if (data.url !== "" && data.slug !== "") {
            await fetch('http://localhost:8080/api', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    data
                }),
            }).then((res) => {
                if (res.ok) {
                    let lbl = document.getElementById('txtLbl');
                    lbl.innerText = "Created! https://www.bestsong.co.uk " + this.state.data.slug;
                    lbl.classList.remove('err');
                    lbl.classList.add('success');
                } else if (res.status === 400) {
                    res.json().then(errMsg => {
                        console.log(errMsg.message);
                        let lbl = document.getElementById('txtLbl');
                        lbl.classList.remove('success');
                        lbl.classList.add('err');
                        lbl.innerText = errMsg.message;
                    });
                }
            }).catch(res => {
                console.log(res);
            })
        }
    }

    render() {
        return (
        <div class="center">
            <div class="lbl" id="txtLbl">New link: https://bestsong.co.uk/</div>
            <div class="url-box">
                <input placeholder={ this.state.urlEmpty ? "Enter a URL (Cannot be empty!)" : "Enter a URL"} className={ this.state.urlEmpty ? "err-input" : ""}
                 onChange={(evt) => { this.urlChanged(this, evt); }} id="urlInput"/><br/>
            </div>
            <div class="url-box">
                <input placeholder={ this.state.urlEmpty ? "Enter URL Slug (Cannot be empty!)" : "Enter URL Slug"} className={ this.state.slugEmpty ? "bottom err-input" : "bottom"} id="slug" onChange={(evt) => { this.slugChanged(this, evt); }}/><br/>
            </div>
            <button class="submit-btn" onClick={() => {this.submit(this)}}>Submit<i class="fa fa-angle-right arrow"></i></button>
        </div>
        )
    }
}

export function registerCard(type, label) {

    if(window._registerCard) {
        window._registerCard(type, label);
        return;
    }
    window._customCardButtons = [];

    window._registerCard = (el, name) => {
        window._customCardButtons.push({el, name})
    };
    customElements.whenDefined("hui-card-picker").then(() => {
        const cardPicker = customElements.get("hui-card-picker");
        cardPicker.prototype.firstUpdated = function () {
            this._customCardButtons = document.createElement("div");
            this._customCardButtons.classList.add("cards-container");
            this._customCardButtons.id = "custom";
            this._customCardButtons.style.borderTop = "1px solid var(--primary-color)";
            window._customCardButtons.forEach
            this.shadowRoot.appendChild(this._customCardButtons);
            window._customCardButtons.forEach(b => {
                const button = document.createElement("mwc-button");
                button.type = "custom:"+b.el;
                button.innerHTML = b.name;
                button.addEventListener("click", this._cardPicked);
                this._customCardButtons.appendChild(button);
            });
        };
    });
    window._registerCard(type, label);
}

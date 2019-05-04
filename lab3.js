function createDownloadButton(canvas) {
    let downloadButton = document.createElement('a');
    downloadButton.innerHTML = 'Download image';
    downloadButton.href = canvas.toDataURL();
    downloadButton.download = "quote.png";
    downloadButton.style =
        "  margin: 30px;\n" +
        "  padding: 10px;\n" +
        "\n" +
        "  overflow: hidden;\n" +
        "\n" +
        "  border-width: 0;\n" +
        "  outline: none;\n" +
        "text-decoration: none;" +
        "  border-radius: 2px;\n" +
        "  box-shadow: 0 1px 4px rgba(0, 0, 0, .6);\n" +
        "  \n" +
        "  background-color: #2ecc71;\n" +
        "  color: #ecf0f1;\n" +
        " font-family: Helvetica; ";
    return downloadButton;
}

function breakdownText(textString, canvas) {
    let words = textString.split(new RegExp("\\s"));
    let text = [];
    let currentLine = words.shift();

    while (words.length > 0) {
        let currentWord = words.shift();
        if (canvas.getContext("2d").measureText(currentLine + currentWord).width < canvas.width * .8) {
            currentLine += " " + currentWord;
        } else {
            text.push(currentLine);
            currentLine = currentWord;
        }
    }

    text.push(currentLine);
    return text;
}




let canvas = document.createElement("canvas");
canvas.width = 1500;
canvas.height = 1500;

let ctx = canvas.getContext("2d");

const FONT_PX = 100;
ctx.font = `bold ${FONT_PX}px Helvetica`;
ctx.textAlign = 'center';
ctx.verticalAlign = 'middle';
ctx.textBaseline = 'top';

let imageSize = {
    width: 1000,
    height: 1000
};
let offset = {
    x: Math.ceil(Math.random() * (canvas.width - 2 * imageSize.width - 1)),
    y: Math.ceil(Math.random() * (canvas.height - 2 * imageSize.height - 1))
};


let promises = Array(4).fill(0).map(a => new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => resolve(image);
    image.crossOrigin = "anonymous";
    image.src = `https://source.unsplash.com/collection/1127156/${imageSize.width}x${imageSize.height}?r=${Math.random()}`
}));

let imageArrayPromise = Promise.all(promises);
let textPromise = $.ajax(`https://cors-anywhere.herokuapp.com/https://api.forismatic.com/api/1.0/?method=getQuote&format=text&lang=ru&key=${Math.random()}`);

imageArrayPromise.then(images => {
    ctx.drawImage(images[0], offset.x, offset.y);
    ctx.drawImage(images[1], offset.x + imageSize.width, offset.y);
    ctx.drawImage(images[2], offset.x, offset.y + imageSize.height);
    ctx.drawImage(images[3], offset.x + imageSize.width, offset.y + imageSize.height);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    textPromise.then(textResponse => {
        let text = breakdownText(textResponse, canvas);

        ctx.fillStyle = '#000';

        let middleLineNumber = text.length / 2;
        for (let i = 0; i < text.length; i++) {
            ctx.fillText(text[i], canvas.width / 2, canvas.height / 2 + FONT_PX * (i - middleLineNumber));
        }

        let quoteImage = new Image();
        quoteImage.src = canvas.toDataURL();
        quoteImage.height = canvas.height / 3;
        quoteImage.width = canvas.width / 3;
        document.body.appendChild(quoteImage);

        let downloadButton = createDownloadButton(canvas);
        document.body.appendChild(downloadButton);
    })
});

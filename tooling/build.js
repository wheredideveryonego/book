
const path = require("path");
const fs = require("fs");
const recursive = require("recursive-readdir");
const frontmatter = require("frontmatter");

const remark = require("remark");
const guide = require("remark-preset-lint-markdown-style-guide");
const html = require("remark-html");
const report = require("vfile-reporter");


function renderPage(name, data, file)
{
    // language=HTML
    const htmlDoc = `
<!DOCTYPE html>
<html lang=${data.lang}>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>${data.title}</title>

    <link href="style.css" rel="stylesheet" type="text/css"/>
</head>
<body>
${file}
</body>
</html>
`

    fs.writeFileSync(
        path.join(__dirname, "../docs/" + name),
        htmlDoc
    )

}


function renderToc(docs)
{
    // language=HTML
    const htmlDoc = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>Where did everyone go?</title>

    <link href="style.css" rel="stylesheet" type="text/css"/>
</head>
<body>
<ul>
${docs.map( d => `<li><a href="${d.name}">${d.data.title}</a></li>`)}
</ul>
</body>
</html>
`

    fs.writeFileSync(
        path.join(__dirname, "../docs/index.html"),
        htmlDoc
    )

}




recursive(path.join(__dirname, "../src/"), ["book-*.md"], function (err, fileNames) {

    const docs = [];

    for (let i = 0; i < fileNames.length; i++)
    {
        const fileName = fileNames[i];
        const {data, content} = frontmatter(fs.readFileSync(fileName, "UTF-8"))


        remark()
            .use(guide)
            .use(html)
            .process(content, (err, file) => {
                if (err)
                {
                    throw new Error("ERROR: " + err);
                }

                const name = path.basename(fileName, ".md") + ".html";
                renderPage(name, data, String(file))

                docs.push({
                    name,
                    data
                })
            });

    }

    renderToc(docs);


    // `files` is an array of file paths
});

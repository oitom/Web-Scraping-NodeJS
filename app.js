var express = require('express'), fs = require('fs'), request = require('request'), 
    cheerio = require('cheerio'), app = express();

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// localhost:3000/ipca
app.get('/ipca', function(req, res) {
    var endPoint = "https://www.debit.com.br/tabtr20.php?id=985";

    request(endPoint, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var tabela = Array();

            $(".listagem").each(function(index, value) {
                var anos = Array();
                $(".listagem").eq(index).find("thead").find("tr").find("th").each(function(i, v) { 
                    if(i > 0)
						anos.push($(v).text().trim());
                });

                $(".listagem").eq(index).find("tbody").find("tr").each(function(i, v) {
                    $(v).find('td').each(function(j, vl) { 
                        if(j > 0 ) { 
                            tabela.push({
                                ano : anos[j - 1],
                                mes:  i + 1,
                                vl: $(vl).text()
                            });
                        }
                    });
                });
            });

            tabela = tabela.sort((a, b) => (a.ano < b.ano) ? 1 : -1);

            var response = { ipca : tabela };

            fs.writeFile("result.json", JSON.stringify(response, null, 4), function(err) {
                console.log('Processo extratido com sucesso');
            }); 
        }
        else 
            res.send(error);
    });
    res.send("OK");
});

// Execução do serviço
app.listen('3000');
console.log('Executando raspagem de dados na porta 3000...');
exports = module.exports = app;
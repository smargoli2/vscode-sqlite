
import { ResultSet } from "../database/resultSet";
import { formatToJSON, formatToCSV } from "./resultFormatter";
import { Disposable, commands } from "vscode";
import { Webview } from "./webview";
import { Constants, Commands } from "../constants/constants";
import { join } from "path";


export class ResultView implements Disposable {
    private webview: Webview;
    private resultSet?: ResultSet;
    private resourcesPath: string;

    constructor(extensionPath: string) {
        this.resourcesPath = join(extensionPath, 'resources');
        this.webview = new Webview(this.resourcesPath, 'query-result', Constants.webviewPanelTitle);
        this.webview.on('export.json', (data: Object) => this.exportJson(data));
        this.webview.on('export.csv', (data: Object) => this.exportCsv(data));
    }

    show(resultSet: ResultSet): void {
        this.resultSet = resultSet;

        let tplPath = join(this.resourcesPath, 'views', 'query_result', 'html', 'index.html.tpl');
        try {
            this.webview.show(tplPath, {resultSet: resultSet});
        } catch(err) {
            console.log(err);
        }
    }

    private exportJson(data: Object) {
        let result_id = data.hasOwnProperty('result_id')? Number.parseInt((<any>data)['result_id']) : -1;
        let json: string = '{}';
        if (this.resultSet) {
            json = formatToJSON(this.resultSet, result_id);
        }
        commands.executeCommand(Commands.showAndSaveNewFile, 'json', json);
    }

    private exportCsv(data: Object) {
        let result_id = data.hasOwnProperty('result_id')? Number.parseInt((<any>data)['result_id']) : -1;
        let csv: string = '';
        if (this.resultSet) {
            csv = formatToCSV(this.resultSet, result_id);
        }
        commands.executeCommand(Commands.showAndSaveNewFile, 'csv', csv);
    }

    dispose() {
        this.webview.dispose();
        console.log(this.webview);
    }
}



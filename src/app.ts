import * as EPUBcfi from 'readium-cfi-js';

export class App {
  message: string;
  iFrame: HTMLIFrameElement;
  fragmentStart: string;
  fragmentEnd: string;

  private selection = (event) => {
    var selection = this.iFrame.contentWindow.getSelection();

    let start = selection.anchorNode;
    let end = selection.focusNode;
    let anchorOffset = selection.anchorOffset;
    let focusOffset = selection.focusOffset;

    let isSelectionBackwards = false;
    let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        isSelectionBackwards = true;
    }
    if(isSelectionBackwards){
      start = selection.focusNode;
      end = selection.anchorNode;
      anchorOffset = selection.focusOffset;
      focusOffset = selection.anchorOffset;
    }
    var generatedCFI = EPUBcfi.Generator.generateRangeComponent(start, anchorOffset, end, focusOffset);
    console.log(generatedCFI);
    let fragments = generatedCFI.split(",");
    this.fragmentStart = fragments[0] + fragments[1];
    this.fragmentEnd = fragments[0] + fragments[2];
  }

  private async fileselected(event: Event){
    this.fragmentStart = "";
    this.fragmentEnd = "";
    var files = (<any>event.target).files; 
    this.iFrame = document.getElementById("iframe") as HTMLIFrameElement;
    if (files && files.length > 0) { 
      
      var content = await this.readFile(files[0]);
      var doc = this.iFrame.contentWindow && this.iFrame.contentWindow.document;
      doc.open();
      doc.write(content);
      doc.close();
      doc.addEventListener("mouseup", (event) => {
        console.log("mouseup");
        this.selection(event);
      });
    }
  }

  readFile(file) : Promise<string> {
    return new Promise(function(resolve, reject){
      const blobContent = new Blob([file], { type: "application/xhtml+xml" });
      var reader = new FileReader();
      reader.onload = function(evt: any){
          console.log("Just read", file.name);
          // must replace the xhtml: namespace
          let result = evt.target.result.replace(new RegExp("xhtml:", 'g'), "");
          resolve(result);
      };
      reader.onerror = function(err) {
          console.error("Failed to read", file.name, "due to", err);
          reject(err);
      };
      reader.readAsText(blobContent);
    });
  }
}

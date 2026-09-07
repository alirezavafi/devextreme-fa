export type Framework = 'Angular' | 'React' | 'Vue';

export type Args = {
  framework: Framework,
  'copy-metadata': boolean,
};

export interface Demo {
  Title: string;
  Name: string;
  DocUrl: string;
  Widget: string;
  DemoType: string;
}

export interface Group {
  Name: string;
  Equivalents: string;
  Demos?: Demo[];
  // Widgets with many demos (Scheduler, DataGrid, the charts) nest a second
  // level of groups instead of listing demos directly.
  Groups?: Group[];
}

export interface Item {
  Name: string;
  Equivalents: string;
  Groups: Group[];
}

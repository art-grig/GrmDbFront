import React, { useMemo, useRef, useState, useEffect } from 'react';
import MaterialReactTable from 'material-react-table';
import type { MRT_ColumnDef } from 'material-react-table';
import './App.css';

interface YourDataType {

  company:{
    company:string;
  };
  pe:{
    pe:string;
  };
  name: {
    firstName: string;
    lastName: string;
    
  };
  votes: number;
}

//a more complex example with nested data
const data: YourDataType[] = [
  {
    company:{
      company: 'GRM'
    } ,
    pe:{
      pe: '-'
    } ,
    name: {
      firstName: 'John', //accessorKey or accessorFn will need to be "name.firstName" to access this value
      lastName: 'Doe',
    },
    votes: 30,
  },
  {
    company:{
      company: '-'
    } ,
    pe:{
      pe: 'Test Text LLC'
    } ,
    name: {
      firstName: 'William ', //accessorKey or accessorFn will need to be "name.firstName" to access this value
      lastName: 'Johnson',
    },
    votes: 22,
  },
];

export default function App() {
  
}
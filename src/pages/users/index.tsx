import React ,{useState , FC, useRef} from 'react';
import { Table,Tag , Modal, Button, Popconfirm ,Pagination,message} from 'antd';
import ProTable, {ProColumns, TableDropdown} from '@ant-design/pro-table';
import { connect, Loading, Dispatch, UserState ,useDispatch} from 'umi';
import UserModal from './components/UserModal';
import {editRecord, addRecord} from './service';
import { SingleUserType, FormValues } from './data.d'

interface UserPageProps{
  users:UserState,
  dispatch: Dispatch,
  userListLoading: boolean,
}

const UserListPage:FC<UserPageProps> =({users ,dispatch, userListLoading})=>{
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setconfirmLoading] = useState(false);
  const [record, setRecord] = useState<SingleUserType | undefined>(undefined);
  const columns:ProColumns<SingleUserType>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'digit',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      valueType: 'text',
      render: (text:any) => <a>{text}</a>
    },
    {
      title: 'Create Time',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      key: 'acreate_time',
    },
    {
      title:'Action',
      key:'action', 
      valueType: 'option',
      render: (text:any,record:SingleUserType) => [
        <a onClick={()=>{
          editHandler(record);
        }}>Edit</a>, 
        <Popconfirm
          title="Are you sure delete this task?"
          onConfirm={()=>{
            deleteHandler(record);
          }}  
          okText="Yes"
          cancelText="No">
          <a>Delete</a>
        </Popconfirm>
      ],
    },
  ];

  const deleteHandler = (record:SingleUserType) => {
    const id = record.id;
    dispatch({
      type:'users/delete',
      payload:{id},
    });
  };
    
  const editHandler = (record:SingleUserType) => {
    setModalVisible(true);
    setRecord(record);
  };

  const closeHandler = () => {
    setModalVisible(false);
  };

  const onFinish = async(values:FormValues) => {
    setconfirmLoading(true);
    let id=0;
    if(record){
      id=record.id;
    }

    let serviceFun;
    if(id) {
      serviceFun= editRecord;
    } else {
      serviceFun= addRecord;
    }

    const result = await serviceFun({id, values});
    if(result){
      setModalVisible(false);
      message.success(`${id ===0 ? 'Add':'Edit'} Successfully.`);
      resetHandler();
      setconfirmLoading(false);
    } else {
      message.error(`${id ===0 ? 'Add':'Edit'} Failed.`);
      setconfirmLoading(false);
    }
  };

  const addHandler = () => {
    setModalVisible(true);
    setRecord(undefined);
  };

  const resetHandler = () => {
    dispatch({
      type: 'users/getRemote',
      payload:{
        page:users.meta.page,
        per_page:users.meta.per_page,
      },
    });
  }

  const paginationHandler = (page:number, pageSize?:number) => {
    dispatch({
      type: 'users/getRemote',
      payload:{
        page,
        per_page:pageSize ? pageSize : users.meta.per_page,
      }
    });
  }

  const pageSizeHandler = (current:number, size:number) => {
    dispatch({
      type: 'users/getRemote',
      payload:{
        page: current,
        per_page:size,
      }
    });
  }

  return (
    <div className='list-table'>
      <ProTable
        dataSource={users.data} 
        columns={columns} 
        rowKey="id" 
        loading={userListLoading}
        search={false}
        pagination={false}
        options={{  
          density: true,
          fullScreen: true,
          reload:()=>{
            resetHandler();
          },
          setting: true,
        }}
        headerTitle="Users List"
        toolBarRender={()=>[
          <Button type="primary" onClick={addHandler}>
            Add
          </Button>,
          <Button onClick={resetHandler}>
            Reload
          </Button>          
        ]}
      />
      <Pagination
        className="list-page"
        total={users.meta.total}
        onChange={paginationHandler}
        onShowSizeChange={pageSizeHandler}
        current={users.meta.page}
        pageSize={users.meta.per_page}
        showSizeChanger
        showQuickJumper
        showTotal={total=>`Total ${total} items`}
      />
      <UserModal 
        visible={modalVisible} 
        closeHandler={closeHandler} 
        record={record}
        onFinish={onFinish}
        confirmLoading={confirmLoading}
      ></UserModal> 
    </div>
  );
};

const mapStateToProps=({users, loading}: { users:UserState, loading: Loading})=>{
  return{
    users,
    userListLoading:loading.models.users,
  };
};

export default connect(mapStateToProps)(UserListPage);
﻿/*************************************************************************
This script demonstrates how to create a ascii custom log/console script.
IMPORTANT!
To reload a changed custom console/log script the corresponding checkbox in the settings dialog must
be unchecked and then checked again or the corresponding search button must be pressed.
***************************************************************************/

/*
  * This function is called if:
  * - data has been sent
  * - data has been received
  * - a user message has been entered (from message dialog or normal script (scriptThread.addMessageToLogAndConsoles))
  * Here the string is created which shall be added to the custom console or to the custom log (argument isLog)
  *
  * Note: The custom console (QTextEdit is used) interprets the returned text as HTML (if a new line shall be created,
  * then a <br> must be returned (and not \n)). 
  * Therefore every created console string can have its own format (text color, text size, font family, ...).->see below
  * If no format information is given then the format settings from the settings dialog are used (text color=receive color).
  *
  * The created log strings are directly (without interpreting the content)  written into the custom log file.
  *
  * If the data is send with a CAN interface then the first bytes are:
  * Byte 0= message type (0=standard, 1=standard remote-transfer-request, 2=extended, 3=extended remote-transfer-request)
  * Byte 1-4 (MSB)= can id 
  * Byte 5-12= the data.  
  *
  * If the data is received with a CAN interface then the first bytes are:
  * Byte 0= message type (0=standard, 1=standard remote-transfer-request, 2=extended, 3=extended remote-transfer-request)
  * Byte 1-4 (MSB)= can id 
  * Byte 5-8 (MSB)=timestamp (difference between the first received CAN message (after the last connect) and the current)
  * Byte 9-16= the data.  
  *
  * If the data is send or received with a I2C master interface then the first bytes are:
  * Byte 0= flags bits (1=10 bit address, 2=combined FMT, 4=no stop condition)
  * Byte 1-2 (MSB)= I2C address
  * Byte 3-n= the data.  
  *
  * @param data
  *   The data.
  * @param timeStamp
  *      The time stamp (the format is set in the settings dialog).
  * @param type
  *   0=the data has been received from a standard interface (all but CAN or I2C master)
  *   1=the data has been sent with a standard interface (all but CAN or I2C master)
  *   2=the data has been received from the CAN interface
  *   3=the data has been sent with a CAN interface
  *   4=the data is a user message (from message dialog or normal script (scriptThread.addMessageToLogAndConsoles))
  *   5=the data has been received from the I2C master interface
  *   6=the data has been sent with a I2C master interface
  * @param isLog
  *   True if this call is for the custom log (false=custom console)
  */
function createString(data, timeStamp, type, isLog)
{
	
	
	createTableAndInsertData("test1");
	
	//Only the errors are returned.
	var resultString = errorString;
	errorString = "";
	return resultString;
}

function getLastIdFromTable(name)
{
	var resultNumber = 0;
	var sqlQuery = scriptSql.createQuery(db, "select id from " + name);
	if (!sqlQuery.isActive()) 
	{
		errorString = 'Insert failed: ' + sqlQuery.lastError().text() + " " + sqlQuery.lastQuery();
		return -1;
    }
	db.commit();
	
	//Get the largest id.
	while (sqlQuery.next()) 
	{
        var id = sqlQuery.value("id");
		if(id > resultNumber)
		{
			resultNumber = id;
		}
    }
	
	return resultNumber;
}

function createTableAndInsertData(name)
{
	var sqlString = "create table if not exists " +  name + " (id int primary key, name varchar(20))" 
	var sqlQuery = scriptSql.createQuery(db, sqlString);
	if (!sqlQuery.isActive()) 
	{
		errorString = 'Create Table Fail: ' + sqlQuery.lastError().text() + " " + sqlQuery.lastQuery();
		return false;
    }

	db.commit();
	
	var id = getLastIdFromTable(name);

	if(id != -1)
	{
		id += 1;
		sqlQuery.exec("INSERT INTO " + name + " (id, name) VALUES (" + id + ", 'John" + id +"')" )
		if (!sqlQuery.isActive()) 
		{
			errorString = 'Insert failed: ' + sqlQuery.lastError().text() + " " + sqlQuery.lastQuery();
			return false;
		}
		db.commit();
		
	}
		
    return true;
}

cust.appendTextToConsole("CustomLogConsole_Sql.js started", true, false);

var errorString  = "";
var db = scriptSql.addDatabase("QSQLITE")
db.setDatabaseName(scriptFile.getScriptFolder() + "/testLog.db3");
db.open();
if(!db.isOpen())
{
	errorString = "could not open db";
}
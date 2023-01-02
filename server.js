const inquirer = require("inquirer");
const mysql = require("mysql2");
var connection = mysql.createConnection({
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "Rmzn1118",
  database: "employee_db",
});
//connection
connection.connect((err) => {
  if (err) throw err;

  startMenu();
});
//main menu
startMenu = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "Add Department",
          "Exit Menu",
        ],
        name: "choices",
      },
    ])
    .then((data) => {
      switch (data.choices) {
        case "View All Employees":
          viewEmployee();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "Add Role":
          addRole();
          break;
        case "View All Departments":
          viewAllDep();
          break;
        case "Add Department":
          addDep();
          break;
        case "Exit Menu":
          connection.end();
      }
    });
};
//to view all employees
viewEmployee = () => {
  connection
    .promise()
    .query(
      `SELECT
         employee.id, employee.first_name, employee.last_name,
         employee.manager_id,
         roles.title, department.dep_name AS department_name, roles.salary,
         CONCAT (manager.first_name, " ", manager.last_name) as manager_name
         FROM employee
         inner join roles on employee.role_id = roles.id
         inner join department on roles.department_id = department.id
         LEFT OUTER join employee AS manager ON manager.id = employee.manager_id
         `
    )
    .then((results, err) => {
      console.table(results[0]);
      startMenu();
    });
};
//adding an employee
addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "employeeFirstName",
        message: "Add Employee First Name",
      },
      {
        type: "input",
        name: "employeeLastName",
        message: "Add Employee Last Name",
      },
      {
        type: "input",
        name: "employeeRole",
        message: "Add Employee Role ID",
      },
      {
        type: "input",
        name: "employeeManager",
        message: "Add Employee Manager ID",
      },
    ])
    .then((data) => {
      console.log(data);
      if (data.employeeManager == "") {
        data.employeeManager = null;
      }
      let values = {
        first_name: data.employeeFirstName,
        last_name: data.employeeLastName,
        role_id: data.employeeRole,
        manager_id: data.employeeManager,
      };
      connection
        .promise()
        .query(`INSERT INTO employee SET ?`, values, function (err, results) {
          console.log(results);
        })
        .then((results, err) => {
          console.log(results);
          startMenu();
        });
    });
};
// updating an employee
updateEmployeeRole = () => {
  console.log("kjda");
  connection
    .promise()
    .query(
      `SELECT employee.id, employee.first_name, employee.last_name, employee.role_id FROM employee`
    )
    .then((results, err) => {
      if (err) throw err;

      const employeeList = results[0].map(({ first_name, last_name, id }) => ({
        name: `${first_name} ${last_name}`,
        value: id,
      }));

      inquirer
        .prompt([
          {
            type: "list",
            message: " Select a employee",
            name: "employeeID",
            choices: employeeList,
          },
        ])
        .then((selectedEmployee) => {
          const empId = selectedEmployee.employeeID;
          connection
            .promise()
            .query(`SELECT * FROM roles`)
            .then(([roles]) => {
              console.log(roles);
              const roleList = roles.map(({ title, id }) => ({
                name: title,
                value: id,
              }));

              inquirer
                .prompt([
                  {
                    type: "list",
                    message: "What is the new title of employee",
                    name: "newTitle",
                    choices: roleList,
                  },
                ])
                .then((newTitle) => {
                  const newRole = newTitle.newTitle;
                  connection
                    .promise()
                    .query("UPDATE employee SET role_id = ? WHERE id = ?", [
                      newRole,
                      empId,
                    ])
                    .then((result, err) => {
                      if (err) throw err;

                      console.log("employee role has been updated");
                      startMenu();
                    });
                });
            });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
//view all roles
viewAllRoles = () => {
  connection
    .promise()
    .query(
      "SELECT roles.id, roles.title, roles.salary, department.dep_name FROM roles inner join department on roles.department_id = department.id"
    )
    .then((results, err) => {
      console.table(results[0]);
      startMenu();
    });
};
//adding a role
addRole = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "title",
        message: "Add Role Title",
      },
      {
        type: "input",
        name: "salary",
        message: "Add Salary",
      },
      {
        type: "input",
        name: "department_id",
        message: "Add Department ID",
      },
    ])
    .then((data) => {
      console.log(data);
      let values = {
        title: data.title,
        salary: data.salary,
        department_id: data.department_id,
      };
      connection
        .promise()
        .query(`INSERT INTO roles SET ?`, values)
        .then((results, err) => {
          console.log(results[0]);
          startMenu();
        });
    });
};
//view all departments
viewAllDep = () => {
  connection
    .promise()
    .query("SELECT department.id, department.dep_name FROM department")
    .then((results, err) => {
      console.table(results[0]);
      startMenu();
    });
};
//adding department
addDep = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "departmentName",
        message: "Add Department",
      },
    ])
    .then((data) => {
      console.log(data);
      connection
        .promise()
        .query(
          `INSERT INTO department (dep_name) VALUES (?)`,
          data.departmentName
        )
        .then((results, err) => {
          console.log(results[0]);
          startMenu();
        });
    });
};

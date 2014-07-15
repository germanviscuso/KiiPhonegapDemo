var KiiAdapter = function() {

   	this.initialize = function() {
        var deferred = $.Deferred();
		// Initialize Kii
		Kii.initializeWithSite("8afe06ae", "e8c86eb77f275f806efd5a4b55383f45", KiiSite.US);
		console.log("Kii initialized");
		//Login or signup and store employees if not present
		authenticateAndSave();
        deferred.resolve();
        return deferred.promise();
    }

    this.findById = function(id) {
        var deferred = $.Deferred();
		// Create a user scope bucket named "employees"
		var user = KiiUser.getCurrentUser();
		var bucket = user.bucketWithName("employees");
		// Build the query
		var query = KiiQuery.queryWithClause(KiiClause.equals("id", id));
		query.setLimit(1);
		// Define the callbacks
		var queryCallbacks = {
		  success: function(queryPerformed, resultSet, nextQuery) {
			console.log("findById Query returned successfully. Result set size: " + resultSet.length);
		    if(resultSet.length > 0) {
				var employee = new Object();
				employee.id = resultSet[0].get("id");
				employee.firstName = resultSet[0].get("firstName");
				employee.lastName = resultSet[0].get("lastName");
				employee.managerId = resultSet[0].get("managerId");
				employee.managerName = resultSet[0].get("managerName");
				employee.title = resultSet[0].get("title");
				employee.department = resultSet[0].get("department");
				employee.cellPhone = resultSet[0].get("cellPhone");
				employee.officePhone = resultSet[0].get("officePhone");
				employee.email = resultSet[0].get("email");
				employee.city = resultSet[0].get("city");
				employee.pic = resultSet[0].get("pic");
				employee.twitterId = resultSet[0].get("twitterId");
				employee.blog = resultSet[0].get("blog");
				deferred.resolve(employee);
			} else
				deferred.resolve(null);
		  },
		  failure: function(queryPerformed, anErrorString) {
		    // do something with the error response
			console.log("Query returned with error: " + anErrorString);
			deferred.resolve(null);
		  }
		}
		// Execute the query
		console.log("Executing query");
		bucket.executeQuery(query, queryCallbacks);
        return deferred.promise();
    }

    this.findByName = function(searchKey) {
        var deferred = $.Deferred();
		// Create a user scope bucket named "employees"
		var user = KiiUser.getCurrentUser();
		var bucket = user.bucketWithName("employees");
		// Create the conditions for the query
		var clause1 = KiiClause.startsWith("firstName", capitaliseFirstLetter(searchKey));
		var clause2 = KiiClause.startsWith("lastName", capitaliseFirstLetter(searchKey));
		// Merge the conditions together with an OR
		var totalClause = KiiClause.or(clause1, clause2);
		var query = KiiQuery.queryWithClause(totalClause);
		query.setLimit(10);
		query.sortByAsc("id");
		// Define the callbacks
		var queryCallbacks = {
		  success: function(queryPerformed, resultSet, nextQuery) {
			console.log("findByName Query returned successfully. Result set size: " + resultSet.length);
			var results = [];
		    for(var i=0; i<resultSet.length; i++) {
				var employee = new Object();
				employee.id = resultSet[i].get("id");
				employee.firstName = resultSet[i].get("firstName");
				employee.lastName = resultSet[i].get("lastName");
				employee.managerId = resultSet[i].get("managerId");
				employee.managerName = resultSet[i].get("managerName");
				employee.title = resultSet[i].get("title");
				employee.department = resultSet[i].get("department");
				employee.cellPhone = resultSet[i].get("cellPhone");
				employee.officePhone = resultSet[i].get("officePhone");
				employee.email = resultSet[i].get("email");
				employee.city = resultSet[i].get("city");
				employee.pic = resultSet[i].get("pic");
				employee.twitterId = resultSet[i].get("twitterId");
				employee.blog = resultSet[i].get("blog");
				results[i] = employee;
			}
		    deferred.resolve(results);
		  },
		  failure: function(queryPerformed, anErrorString) {
		    // do something with the error response
			console.log("Query returned with error: " + anErrorString);
			deferred.resolve(null);
		  }
		}
		// Execute the query
		console.log("Executing query");
		bucket.executeQuery(query, queryCallbacks);
        return deferred.promise();
    }

    function saveObjects(bucket) {
        var deferred = $.Deferred();
        // Iterate over employee list
        var l = employees.length;
        for (var i=0; i < l; i++) {
				var employee = bucket.createObject();
				employee.set("id", employees[i].id);
				employee.set("firstName", employees[i].firstName);
				employee.set("lastName", employees[i].lastName);
				employee.set("managerId", employees[i].managerId);
				employee.set("managerName", employees[i].managerName);
				employee.set("title", employees[i].title);
				employee.set("department", employees[i].department);
				employee.set("cellPhone", employees[i].cellPhone);
				employee.set("officePhone", employees[i].officePhone);
				employee.set("email", employees[i].email);
				employee.set("city", employees[i].city);
				employee.set("pic", employees[i].pic);
				employee.set("twitterId", employees[i].twitterId);
				employee.set("blog", employees[i].blog);
				// Save the employee
				employee.save({
				  success: function(theObject) {
				    console.log("Employee saved!");
				    console.log(theObject);
				  },
				  failure: function(theObject, errorString) {
				    console.log("Error saving employee: " + errorString);
				  }
				});
        }
        deferred.resolve();
        return deferred.promise();
    }

	function authenticateAndSave() {
		var username = "demouser";
		var password = "demopassword";
		// Authenticate the user
		KiiUser.authenticate(username, password, {
		  // Called on successful registration
		  success: function(theUser) {
		    // Print some info to the log
		    console.log("User authenticated!");
		    console.log(theUser);
			// Store sample data on Kii backend
			storeEmployees(theUser);
		  },
		  // Called on a failed authentication
		  failure: function(theUser, errorString) {
		    // Print some info to the log
		    console.log("Error authenticating: " + errorString);
			// Try a signup
			// Create the KiiUser object
			var user = KiiUser.userWithUsername(username, password);
			// Register the user, defining callbacks for when the process completes
			user.register({
			  // Called on successful registration
			  success: function(theUser) {
			    // Print some info to the log
			    console.log("User registered!");
			    console.log(theUser);
				// Store sample data on Kii backend
				storeEmployees(theUser);
			  },
			  // Called on a failed registration
			  failure: function(theUser, errorString) {
			    // Print some info to the log
			    console.log("Error registering: " + errorString);
			  }
			});
		  }
		})
		return;
	}
	
	function storeEmployees(user) {
		if(user != null){
			// Create a user scope bucket named "employees"
			var bucket = user.bucketWithName("employees");
			// See if employes are already on the backend
			// Build the query
			console.log("Building query for bucket");
			var query = KiiQuery.queryWithClause(KiiClause.equals("id", 1));
			query.setLimit(1); // get 1 object tops
			// Define the callbacks
			var queryCallbacks = {
			  success: function(queryPerformed, resultSet, nextQuery) {
				console.log("Query returned successfully");
			    // do something with the results
			    if(resultSet.length < 1){
				// populate backend with employees
					console.log("No employees found. Saving objects...");
					saveObjects(bucket);
				} else {
					console.log("Employees already present");
				}			    
			  },
			  failure: function(queryPerformed, anErrorString) {
			    // do something with the error response
				console.log("Query returned with error");
			  }
			}
			// Execute the query
			console.log("Executing query");
			bucket.executeQuery(query, queryCallbacks);			
		}
		else {
			console.log("User is null, can't proceed");
		}
		return;
	}
	
	function capitaliseFirstLetter(string)
	{
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}

    var employees = [
        {"id": 1, "firstName": "James", "lastName": "King", "managerId": 0, "managerName": "", "title": "President and CEO", "department": "Corporate", "cellPhone": "617-000-0001", "officePhone": "781-000-0001", "email": "jking@fakemail.com", "city": "Boston, MA", "pic": "James_King.jpg", "twitterId": "@fakejking", "blog": "http://coenraets.org"},
        {"id": 2, "firstName": "Julie", "lastName": "Taylor", "managerId": 1, "managerName": "James King", "title": "VP of Marketing", "department": "Marketing", "cellPhone": "617-000-0002", "officePhone": "781-000-0002", "email": "jtaylor@fakemail.com", "city": "Boston, MA", "pic": "Julie_Taylor.jpg", "twitterId": "@fakejtaylor", "blog": "http://coenraets.org"},
        {"id": 3, "firstName": "Eugene", "lastName": "Lee", "managerId": 1, "managerName": "James King", "title": "CFO", "department": "Accounting", "cellPhone": "617-000-0003", "officePhone": "781-000-0003", "email": "elee@fakemail.com", "city": "Boston, MA", "pic": "Eugene_Lee.jpg", "twitterId": "@fakeelee", "blog": "http://coenraets.org"},
        {"id": 4, "firstName": "John", "lastName": "Williams", "managerId": 1, "managerName": "James King", "title": "VP of Engineering", "department": "Engineering", "cellPhone": "617-000-0004", "officePhone": "781-000-0004", "email": "jwilliams@fakemail.com", "city": "Boston, MA", "pic": "John_Williams.jpg", "twitterId": "@fakejwilliams", "blog": "http://coenraets.org"},
        {"id": 5, "firstName": "Ray", "lastName": "Moore", "managerId": 1, "managerName": "James King", "title": "VP of Sales", "department": "Sales", "cellPhone": "617-000-0005", "officePhone": "781-000-0005", "email": "rmoore@fakemail.com", "city": "Boston, MA", "pic": "Ray_Moore.jpg", "twitterId": "@fakermoore", "blog": "http://coenraets.org"},
        {"id": 6, "firstName": "Paul", "lastName": "Jones", "managerId": 4, "managerName": "John Williams", "title": "QA Manager", "department": "Engineering", "cellPhone": "617-000-0006", "officePhone": "781-000-0006", "email": "pjones@fakemail.com", "city": "Boston, MA", "pic": "Paul_Jones.jpg", "twitterId": "@fakepjones", "blog": "http://coenraets.org"},
        {"id": 7, "firstName": "Paula", "lastName": "Gates", "managerId": 4, "managerName": "John Williams", "title": "Software Architect", "department": "Engineering", "cellPhone": "617-000-0007", "officePhone": "781-000-0007", "email": "pgates@fakemail.com", "city": "Boston, MA", "pic": "Paula_Gates.jpg", "twitterId": "@fakepgates", "blog": "http://coenraets.org"},
        {"id": 8, "firstName": "Lisa", "lastName": "Wong", "managerId": 2, "managerName": "Julie Taylor", "title": "Marketing Manager", "department": "Marketing", "cellPhone": "617-000-0008", "officePhone": "781-000-0008", "email": "lwong@fakemail.com", "city": "Boston, MA", "pic": "Lisa_Wong.jpg", "twitterId": "@fakelwong", "blog": "http://coenraets.org"},
        {"id": 9, "firstName": "Gary", "lastName": "Donovan", "managerId": 2, "managerName": "Julie Taylor", "title": "Marketing Manager", "department": "Marketing", "cellPhone": "617-000-0009", "officePhone": "781-000-0009", "email": "gdonovan@fakemail.com", "city": "Boston, MA", "pic": "Gary_Donovan.jpg", "twitterId": "@fakegdonovan", "blog": "http://coenraets.org"},
        {"id": 10, "firstName": "Kathleen", "lastName": "Byrne", "managerId": 5, "managerName": "Ray Moore", "title": "Sales Representative", "department": "Sales", "cellPhone": "617-000-0010", "officePhone": "781-000-0010", "email": "kbyrne@fakemail.com", "city": "Boston, MA", "pic": "Kathleen_Byrne.jpg", "twitterId": "@fakekbyrne", "blog": "http://coenraets.org"},
        {"id": 11, "firstName": "Amy", "lastName": "Jones", "managerId": 5, "managerName": "Ray Moore", "title": "Sales Representative", "department": "Sales", "cellPhone": "617-000-0011", "officePhone": "781-000-0011", "email": "ajones@fakemail.com", "city": "Boston, MA", "pic": "Amy_Jones.jpg", "twitterId": "@fakeajones", "blog": "http://coenraets.org"},
        {"id": 12, "firstName": "Steven", "lastName": "Wells", "managerId": 4, "managerName": "John Williams", "title": "Software Architect", "department": "Engineering", "cellPhone": "617-000-0012", "officePhone": "781-000-0012", "email": "swells@fakemail.com", "city": "Boston, MA", "pic": "Steven_Wells.jpg", "twitterId": "@fakeswells", "blog": "http://coenraets.org"}
    ];
}
access(all) contract LandRegistry {

    // Define structure to represent a piece of land
    access(all) struct Land {
        access(account) var owner: Address
        access(account) var location: String
        access(account) var area: Int

        // Initialize the owner field in the struct definition
        init(owner: Address, location: String, area: Int) {
            self.owner = owner
            self.location = location
            self.area = area
        }
    }

    // Declare a public dictionary to store land information
    access(all) var lands: {String: Land}

    // Event emitted when land is registered
    access(all) event LandRegistered(location: String, area: Int, owner: Address)

    // Event emitted when land ownership is transferred
    access(all) event OwnershipTransferred(location: String, newOwner: Address)

    // Initialize the contract
    init() {
        self.lands = {}
    }

    // Function to register a new piece of land
    access(all) fun registerLand(location: String, area: Int) {
        pre {
            !self.lands.containsKey(location): "Land is already registered"
        }
        post {
            self.lands.containsKey(location): "Land registration failed"
        }

        let land = Land(owner: self.account.address, location: location, area: area)
        self.lands[location] = land
        emit LandRegistered(location: location, area: area, owner: self.account.address)
    }

    // Function to transfer ownership of a piece of land
    access(all) fun transferOwnership(location: String, newOwner: Address) {
        pre {
            self.lands.containsKey(location): "Land does not exist"
        }

        let land = self.lands[location]!
        if land.owner == self.account.address {
            let updatedLand = Land(owner: newOwner, location: land.location, area: land.area)
            self.lands[location] = updatedLand
            emit OwnershipTransferred(location: location, newOwner: newOwner)
        } else {
            panic("Only the current owner can transfer ownership")
        }
    }

    // Function to get the owner of a piece of land
    access(all) fun getOwner(location: String): Address? {
        return self.lands[location]?.owner
    }
}
